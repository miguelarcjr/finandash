import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { generatePdfFromHtml } from "~/lib/pdf/puppeteer";
import { getTemplateHtml } from "~/lib/boleto/templates-html";
import { gerarCodigoBarras, gerarLinhaDigitavel, renderBarcodeImageBase64 } from "~/lib/boleto/digito-verificador";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { tenantId } = session.user;

    const boleto = await db.boleto.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        cliente: true,
        tenant: true,
      },
    });

    if (!boleto) {
      return new NextResponse("Boleto não encontrado", { status: 404 });
    }

    if (boleto.status === "CANCELADO") {
      return new NextResponse("Não é possível gerar PDF de boleto cancelado", { status: 400 });
    }

    // Gerar cálculos do código de barras
    // Mock do DV logic 
    const codigoBarras = gerarCodigoBarras(
      boleto.banco, 
      boleto.nossoNumero, 
      Number(boleto.valor), 
      boleto.vencimento
    );
    const linhaDigitavel = gerarLinhaDigitavel(codigoBarras);
    const barcodeImage = await renderBarcodeImageBase64(codigoBarras);

    const bancoNome = boleto.banco === "ITAU" ? "Banco Itaú S.A." : "Banco Sicoob";
    const bancoCodigo = boleto.banco === "ITAU" ? "341-7" : "756-0";
    
    // Renderiza HTML
    const html = getTemplateHtml({
      bancoNome,
      bancoCodigo,
      linhaDigitavel,
      cedenteNome: boleto.tenant.name,
      cedenteCnpj: "00.000.000/0001-00", // Fake format
      localPagamento: "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO",
      sacadoNome: boleto.cliente.nome,
      sacadoCpfCnpj: boleto.cliente.cpfCnpj || "Não informado",
      vencimento: boleto.vencimento.toLocaleDateString('pt-BR'),
      valorDocumento: Number(boleto.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      nossoNumero: boleto.nossoNumero,
      numeroDocumento: `${boleto.parcela || 1}/${boleto.totalParcelas || 1}`,
      dataProcessamento: boleto.createdAt.toLocaleDateString('pt-BR'),
      barcodeImageBase64: barcodeImage
    });

    // Converter para PDF
    const pdfBuffer = await generatePdfFromHtml(html);

    // Header para forçar download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="boleto-${boleto.nossoNumero}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Erro na geração do PDF:", error);
    return new NextResponse(`Erro ao gerar PDF: ${error.message}`, { status: 500 });
  }
}
