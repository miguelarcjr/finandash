// Dicionário de códigos de ocorrência CNAB para descrições amigáveis
// Padrão Febraban — aplicável a Sicoob e Itaú com pequenas variações
export const OCORRENCIAS_CNAB: Record<string, string> = {
  "01": "Remessa enviada ao banco",
  "02": "Baixa solicitada",
  "03": "Abatimento concedido",
  "04": "Abatimento cancelado",
  "05": "Liquidação sem registro",
  "06": "Liquidação normal (PAGO)",
  "07": "Liquidação parcial",
  "08": "Entrada confirmada no banco",
  "09": "Baixa automática por vencimento",
  "10": "Baixa a pedido",
  "11": "Título em cartório",
  "12": "Abatimento",
  "13": "Suspensão de protesto",
  "14": "Vencimento alterado",
  "15": "Baixa protesto",
  "17": "Liquidação após baixa",
  "19": "Confirmação de instrução",
  "20": "Confirmação de recebimento de instrução",
  "23": "Remessa a protesto confirmada",
  "24": "Instrução de protesto rejeitada",
  "25": "Protestado e baixado",
  "26": "Instrução rejeitada",
  "27": "Confirmação de pedido de negativação",
  "28": "Manutenção em cartório (garantia após vencimento)",
  "30": "Rejeição (dado inválido)",
  "40": "Estorno da entrada",
  "96": "Instruções processadas",
  "97": "Confirmação de instrução",
  "98": "Liquidação em garantia",
  "99": "Confirmação de entrada no sistema",
};

export function descricaoOcorrencia(codigo: string): string {
  return OCORRENCIAS_CNAB[codigo] ?? `Ocorrência desconhecida (cód. ${codigo})`;
}
