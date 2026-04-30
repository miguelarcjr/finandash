import type { Boleto, Cliente, Tenant } from "../../../generated/prisma";

export type BoletoInput = Boleto & { cliente: Cliente, tenant: Tenant };

// Preenche texto vazio com espaços à direita
const formatStr = (str: string, size: number) => {
  return (str || "").substring(0, size).padEnd(size, ' ');
}

// Preenche números com zeros à esquerda
const formatNum = (num: number | string, size: number) => {
  return String(num).padStart(size, '0');
}

/**
 * Gera um arquivo remessa MOCK focado no padrão CNAB 400 do Sicoob
 * Para um ambiente de produção real as especificações de cada byte
 * devem ser implementadas.
 */
export function generateSicoobRemessa(boletos: BoletoInput[]): string {
  let remessa = "";
  
  // HEADER (Linha 1)
  const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '');
  remessa += `01REMESSA01COBRANCA       33333333000100EMP SICOOB FINANDASH   756SICOOB         ${dataHoje}00000001${formatStr("", 294)}000001\r\n`;

  // DETALHES (Boletos)
  let sequencial = 2;
  for (const boleto of boletos) {
    const valor = Math.floor(Number(boleto.valor) * 100);
    const vencimento = boleto.vencimento.toLocaleDateString('pt-BR').replace(/\//g, '');
    const nossoNumero = formatNum(boleto.nossoNumero, 12);
    
    // Detalhe dummy de 400 bytes focado em preencher as posições
    remessa += `10233333333000100${formatStr(boleto.tenant.name, 30)}${nossoNumero}${formatStr("", 39)}${vencimento}${formatNum(valor, 13)}${formatStr(boleto.cliente.nome, 30)}${formatStr(boleto.cliente.cpfCnpj || "", 14)}${formatStr("", 196)}${formatNum(sequencial, 6)}\r\n`;
    sequencial++;
  }

  // TRAILLER
  remessa += `9${formatStr("", 393)}${formatNum(sequencial, 6)}\r\n`;

  return remessa;
}
