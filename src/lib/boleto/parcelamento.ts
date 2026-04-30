/**
 * Calcula o valor de cada parcela de forma que a soma exata resulte no valor total.
 * O arredondamento é para duas casas decimais, e eventuais centavos de diferença 
 * são adicionados à última parcela.
 */
export function calcularParcelas(valorTotal: number, quantidadeParcelas: number): number[] {
  if (quantidadeParcelas <= 0 || valorTotal <= 0) return [];
  
  const parcelaBase = Math.floor((valorTotal / quantidadeParcelas) * 100) / 100;
  const somaBase = parcelaBase * quantidadeParcelas;
  const diferenca = Math.round((valorTotal - somaBase) * 100) / 100;
  
  const parcelas = Array(quantidadeParcelas).fill(parcelaBase);
  if (diferenca > 0 || diferenca < 0) {
    parcelas[quantidadeParcelas - 1] = Math.round((parcelaBase + diferenca) * 100) / 100;
  }
  
  return parcelas;
}

/**
 * Retorna as datas de vencimento com base na data da primeira parcela e intervalo (mensal).
 */
export function calcularVencimentos(primeiroVencimento: Date, quantidadeParcelas: number): Date[] {
  const vencimentos: Date[] = [];
  for (let i = 0; i < quantidadeParcelas; i++) {
    const data = new Date(primeiroVencimento);
    data.setMonth(data.getMonth() + i);
    vencimentos.push(data);
  }
  return vencimentos;
}
