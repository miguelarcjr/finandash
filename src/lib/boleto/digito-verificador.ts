// src/lib/boleto/digito-verificador.ts
import bwipjs from 'bwip-js';

// Função para calcular Módulo 10 genérico Febraban
export function modulo10(numero: string): number {
  let multiplicador = 2;
  let soma = 0;

  for (let i = numero.length - 1; i >= 0; i--) {
    const algarismo = parseInt(numero[i]!, 10);
    let produto = algarismo * multiplicador;
    
    if (produto > 9) {
      produto = Math.floor(produto / 10) + (produto % 10);
    }
    
    soma += produto;
    multiplicador = multiplicador === 2 ? 1 : 2;
  }
  
  const resto = soma % 10;
  const dv = 10 - resto;
  return dv === 10 ? 0 : dv;
}

// Função para calcular Módulo 11 genérico Febraban
export function modulo11(numero: string): number {
  let multiplicador = 2;
  let soma = 0;

  for (let i = numero.length - 1; i >= 0; i--) {
    soma += parseInt(numero[i]!, 10) * multiplicador;
    multiplicador++;
    if (multiplicador > 9) multiplicador = 2;
  }
  
  const resto = soma % 11;
  const dv = 11 - resto;
  
  if (dv === 0 || dv === 10 || dv === 11) return 1;
  return dv;
}

// Gera o código de barras padrão Febraban 44 posições mockado para o MVP
// Na versão final isto integraria regras específicas do Itaú/Sicoob
export function gerarCodigoBarras(banco: string, nossoNumero: string, valor: number, vencimento: Date): string {
  const bancoCodigo = banco === 'ITAU' ? '341' : '756';
  const moeda = '9';
  
  // Fator de vencimento (dias desde 07/10/1997)
  const dataBase = new Date('1997-10-07T00:00:00Z');
  const diffTime = Math.abs(vencimento.getTime() - dataBase.getTime());
  const fatorVencimento = Math.floor(diffTime / (1000 * 60 * 60 * 24)).toString().padStart(4, '0');
  
  // Valor com 10 posições, sem vírgula
  const valorFormatado = Math.floor(valor * 100).toString().padStart(10, '0');
  
  // Campo Livre (mockado com nosso número)
  const campoLivre = nossoNumero.padStart(25, '0');
  
  const barraSemDv = `${bancoCodigo}${moeda}${fatorVencimento}${valorFormatado}${campoLivre}`;
  const dvGeral = modulo11(barraSemDv);
  
  return `${bancoCodigo}${moeda}${dvGeral}${fatorVencimento}${valorFormatado}${campoLivre}`;
}

// Gera a linha digitável com os blocos corretos
export function gerarLinhaDigitavel(codigoBarras: string): string {
  if (codigoBarras.length !== 44) return "CÓDIGO DE BARRAS INVÁLIDO";

  const bloco1 = codigoBarras.substring(0, 4) + codigoBarras.substring(19, 24);
  const dv1 = modulo10(bloco1);
  const campo1 = `${bloco1.substring(0, 5)}.${bloco1.substring(5)}${dv1}`;

  const bloco2 = codigoBarras.substring(24, 34);
  const dv2 = modulo10(bloco2);
  const campo2 = `${bloco2.substring(0, 5)}.${bloco2.substring(5)}${dv2}`;

  const bloco3 = codigoBarras.substring(34, 44);
  const dv3 = modulo10(bloco3);
  const campo3 = `${bloco3.substring(0, 5)}.${bloco3.substring(5)}${dv3}`;

  const campo4 = codigoBarras.substring(4, 5); // DV geral
  const campo5 = codigoBarras.substring(5, 19);

  return `${campo1} ${campo2} ${campo3} ${campo4} ${campo5}`;
}

export async function renderBarcodeImageBase64(codigoBarras: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'interleaved2of5',       // ITF-14 Bank standard
      text: codigoBarras,
      scale: 3,
      height: 10,
      includetext: false,
    }, function (err: Error | string, png: Buffer) {
      if (err) {
        reject(err);
      } else {
        const base64 = png.toString('base64');
        resolve(`data:image/png;base64,${base64}`);
      }
    });
  });
}
