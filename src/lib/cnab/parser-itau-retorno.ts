import type { RetornoBoleto } from "./parser-sicoob-retorno";

/**
 * Faz o PARSE do Retorno CNAB 400 simulado para Itaú
 */
export function parseItauRetorno(conteudo: string): RetornoBoleto[] {
  const linhas = conteudo.split(/\r?\n/).filter(line => line.length >= 400);
  const boletosProcessados: RetornoBoleto[] = [];

  for (const linha of linhas) {
    if (linha.startsWith("1")) {
      // Itaú CNAB400: Nosso Numero 86-93 (8) ou 63-70 depending.
      // Let's assume 86-93 per standard layout
      // Ocorrencia: 109-110 (2)
      // Valor Pago: 254-266 (13)
      
      const nossoNumero = linha.substring(85, 93).trim();
      const ocorrenciaStr = linha.substring(108, 110).trim(); 
      const valorStr = linha.substring(253, 266).trim();
      
      const isPago = ocorrenciaStr === "06"; // 06 = Liquidação normal
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
