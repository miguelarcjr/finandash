import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { cnabRetornoQueue } from "~/server/queue/cnabWorker";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { tenantId } = session.user;

    const formData = await req.formData();
    const arquivo = formData.get("arquivo") as File | null;
    const banco = formData.get("banco") as "SICOOB" | "ITAU" | null;

    if (!arquivo || !banco) {
      return new NextResponse("Arquivo e banco são obrigatórios.", { status: 400 });
    }

    if (!["SICOOB", "ITAU"].includes(banco)) {
      return new NextResponse("Banco inválido.", { status: 400 });
    }

    // Ler o conteúdo do arquivo como texto (encoding latin1 para CNAB)
    const arrayBuffer = await arquivo.arrayBuffer();
    const conteudo = Buffer.from(arrayBuffer).toString("latin1");

    // Validação básica do formato
    const primeiraLinha = conteudo.split(/\r?\n/)[0] ?? "";
    if (!primeiraLinha.startsWith("0")) {
      return new NextResponse(
        "Arquivo CNAB inválido: header não reconhecido.",
        { status: 400 }
      );
    }

    // Enfileirar job no BullMQ
    const job = await cnabRetornoQueue.add("processar-retorno", {
      tenantId,
      banco,
      conteudo,
    });

    return NextResponse.json({
      mensagem: "Arquivo recebido e enfileirado para processamento.",
      jobId: job.id,
    });
  } catch (error: any) {
    console.error("Erro no upload do retorno CNAB:", error);
    return new NextResponse(`Erro: ${error.message}`, { status: 500 });
  }
}
