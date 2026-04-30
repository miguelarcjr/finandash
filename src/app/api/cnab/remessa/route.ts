import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { generateSicoobRemessa } from "~/lib/cnab/generator-sicoob-remessa";
import { generateItauRemessa } from "~/lib/cnab/generator-itau-remessa";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const banco = searchParams.get("banco");

    if (banco !== "SICOOB" && banco !== "ITAU") {
      return new NextResponse("Banco inválido fornecido.", { status: 400 });
    }

    const { tenantId } = session.user;

    // Buscar boletos pendentes daquele banco e tenant
    const boletos = await db.boleto.findMany({
      where: {
        tenantId,
        banco,
        status: "PENDENTE",
      },
      include: {
        cliente: true,
        tenant: true,
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (boletos.length === 0) {
      // De acordo com o critério de aceite 9
      return new NextResponse("Nenhum boleto pendente para remessa", { status: 404 });
    }

    // Gerar string CNAB
    const cnabString = banco === "SICOOB" 
      ? generateSicoobRemessa(boletos) 
      : generateItauRemessa(boletos);

    // Atualizar status para REGISTRADO em lote
    await db.$transaction(async (tx) => {
      const ids = boletos.map(b => b.id);
      await tx.boleto.updateMany({
        where: { id: { in: ids } },
        data: { status: "REGISTRADO" }
      });
    });

    // Converter para Buffer ANSI
    const buffer = Buffer.from(cnabString, "latin1");
    const filename = `REM_${banco}_${new Date().getTime()}.rem`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error("Erro na geração de remessa:", error);
    return new NextResponse(`Erro ao gerar remessa: ${error.message}`, { status: 500 });
  }
}
