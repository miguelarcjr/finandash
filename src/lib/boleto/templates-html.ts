export interface BoletoTemplateData {
  bancoNome: string;
  bancoCodigo: string;
  linhaDigitavel: string;
  cedenteNome: string;
  cedenteCnpj: string;
  sacadoNome: string;
  sacadoCpfCnpj: string;
  vencimento: string;
  valorDocumento: string;
  nossoNumero: string;
  numeroDocumento: string;
  dataProcessamento: string;
  localPagamento: string;
  barcodeImageBase64: string;
}

export const getTemplateHtml = (data: BoletoTemplateData) => `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
    .boleto-container { width: 100%; max-width: 800px; margin: 0 auto; }
    .linha-banco { display: flex; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; justify-content: space-between; align-items: flex-end; }
    .banco-logo { font-size: 18px; font-weight: bold; width: 150px; }
    .banco-codigo { font-size: 18px; font-weight: bold; border-left: 2px solid #000; border-right: 2px solid #000; padding: 0 15px; }
    .linha-digitavel { font-size: 14px; font-weight: bold; flex: 1; text-align: right; }
    
    .table-boleto { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #000; }
    .table-boleto td { border: 1px solid #000; padding: 2px 5px; vertical-align: top; }
    .label { font-size: 9px; display: block; margin-bottom: 2px; }
    .value { font-size: 11px; font-weight: bold; display: block; min-height: 14px; }
    .right-col { width: 150px; background-color: #f5f5f5; }
    
    .barcode-area { padding-top: 10px; }
    .barcode-img { height: 55px; width: 350px; }
    
    .recibo-sacado { border-bottom: 1px dashed #000; margin-bottom: 30px; padding-bottom: 20px; }
    .instrucoes { height: 100px; }
  </style>
</head>
<body>
  <div class="boleto-container">
    
    <!-- RECIBO DO PAGADOR -->
    <div class="recibo-sacado">
      <div class="linha-banco">
        <div class="banco-logo">${data.bancoNome}</div>
        <div class="banco-codigo">${data.bancoCodigo}</div>
        <div class="linha-digitavel">Recibo do Pagador</div>
      </div>
      
      <table class="table-boleto">
        <tr>
          <td colspan="4"><span class="label">Local de Pagamento</span><span class="value">${data.localPagamento}</span></td>
          <td class="right-col"><span class="label">Vencimento</span><span class="value">${data.vencimento}</span></td>
        </tr>
        <tr>
          <td colspan="4"><span class="label">Cedente</span><span class="value">${data.cedenteNome} - ${data.cedenteCnpj}</span></td>
          <td class="right-col"><span class="label">Agência/Código Cedente</span><span class="value">0001/12345-6</span></td>
        </tr>
        <tr>
          <td><span class="label">Data Documento</span><span class="value">${data.dataProcessamento}</span></td>
          <td><span class="label">Número Documento</span><span class="value">${data.numeroDocumento}</span></td>
          <td><span class="label">Espécie Doc.</span><span class="value">RC</span></td>
          <td><span class="label">Aceite</span><span class="value">N</span></td>
          <td class="right-col"><span class="label">Nosso Número</span><span class="value">${data.nossoNumero}</span></td>
        </tr>
        <tr>
          <td colspan="4" rowspan="3" class="instrucoes">
            <span class="label">Instruções</span>
            <span class="value">Sr. Caixa, não receber após o vencimento.<br/>Multa de 2% após o vencimento.</span>
          </td>
          <td class="right-col"><span class="label">Valor Documento</span><span class="value">${data.valorDocumento}</span></td>
        </tr>
        <tr><td class="right-col"><span class="label">(-) Desconto / Abatimento</span><span class="value"></span></td></tr>
        <tr><td class="right-col"><span class="label">(+) Mora / Multa</span><span class="value"></span></td></tr>
        <tr>
          <td colspan="5">
            <span class="label">Sacado</span>
            <span class="value">${data.sacadoNome} - ${data.sacadoCpfCnpj}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- FICHA DE COMPENSAÇÃO -->
    <div class="ficha-compensacao">
      <div class="linha-banco">
        <div class="banco-logo">${data.bancoNome}</div>
        <div class="banco-codigo">${data.bancoCodigo}</div>
        <div class="linha-digitavel">${data.linhaDigitavel}</div>
      </div>
      
      <table class="table-boleto">
        <tr>
          <td colspan="4"><span class="label">Local de Pagamento</span><span class="value">${data.localPagamento}</span></td>
          <td class="right-col"><span class="label">Vencimento</span><span class="value">${data.vencimento}</span></td>
        </tr>
        <tr>
          <td colspan="4"><span class="label">Cedente</span><span class="value">${data.cedenteNome} - ${data.cedenteCnpj}</span></td>
          <td class="right-col"><span class="label">Agência/Código Cedente</span><span class="value">0001/12345-6</span></td>
        </tr>
        <tr>
          <td><span class="label">Data Documento</span><span class="value">${data.dataProcessamento}</span></td>
          <td><span class="label">Número Documento</span><span class="value">${data.numeroDocumento}</span></td>
          <td><span class="label">Espécie Doc.</span><span class="value">RC</span></td>
          <td><span class="label">Aceite</span><span class="value">N</span></td>
          <td class="right-col"><span class="label">Nosso Número</span><span class="value">${data.nossoNumero}</span></td>
        </tr>
        <tr>
          <td colspan="4" rowspan="4" class="instrucoes">
            <span class="label">Instruções</span>
            <span class="value">
              Sr. Caixa, não receber após o vencimento.<br/>
              Multa de 2% após o vencimento.
            </span>
          </td>
          <td class="right-col"><span class="label">Valor Documento</span><span class="value">${data.valorDocumento}</span></td>
        </tr>
        <tr><td class="right-col"><span class="label">(-) Desconto / Abatimento</span><span class="value"></span></td></tr>
        <tr><td class="right-col"><span class="label">(-) Outras Deduções</span><span class="value"></span></td></tr>
        <tr><td class="right-col"><span class="label">(+) Mora / Multa</span><span class="value"></span></td></tr>
        <tr>
          <td colspan="5">
            <span class="label">Sacado</span>
            <span class="value">${data.sacadoNome} - CPF/CNPJ: ${data.sacadoCpfCnpj}</span>
          </td>
        </tr>
      </table>
      
      <div class="barcode-area">
        <img class="barcode-img" src="${data.barcodeImageBase64}" />
      </div>
    </div>
    
  </div>
</body>
</html>
`;
