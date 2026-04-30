export interface RetornoBoleto {
  nossoNumero: string;
  ocorrenciaStr: string;
  isPago: boolean;
  valorPago?: number;
}

/**
 * Faz o PARSE do Retorno CNAB 400 simulado para Sicoob
 * No padrão 400 posições, a ocorrência "06" indica liquidação normal.
 */
export function parseSicoobRetorno(conteudo: string): RetornoBoleto[] {
  const linhas = conteudo.split(/\r?\n/).filter(line => line.length >= 400);
  const boletosProcessados: RetornoBoleto[] = [];

  for (const linha of linhas) {
    // Linha de detalhe em CNAB 400 inicia com "1"
    if (linha.startsWith("1")) {
      // Essas posições divergem para cada banco.
      // Sicoob CNAB400: Nosso Numero 63-73 (11) ou 63-74(12)
      // Ocorrencia: 109-110 (2)
      // Valor Pago: 254-266 (13)
      
      const nossoNumero = linha.substring(62, 74).trim();
      const ocorrenciaStr = linha.substring(108, 110).trim(); // "06" = Liquidação
      const valorStr = linha.substring(253, 266).trim();
      
      const isPago = ocorrenciaStr === "06" || ocorrenciaStr === "05"; // 05 = lq s/registro, 06 = lq normal
      let valorPago = 0;

      if (isPago && valorStr) {
        valorPago = parseInt(valorStr, 10) / 100;
      }

      if (nossoNumero) {
        boletosProcessados.push({
          nossoNumero,
          ocorrenciaStr,
          isPago,
          valorPago: isPago ? valorPago : undefined
        });
      }
    }
  }

  return boletosProcessados;
}
