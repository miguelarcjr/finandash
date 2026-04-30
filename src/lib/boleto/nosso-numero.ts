import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

/**
 * Gera um novo Nosso Número sequencial e unívoco para um tenant e banco específico.
 * Utiliza o recurso de incremento atômico do Prisma dentro de uma transação para garantir
 * que não haja colisões ("lock" lógico seguro para ambientes concorrentes).
 */
export async function gerarNossoNumero(tenantId: string, banco: string): Promise<string> {
  return await db.$transaction(async (tx) => {
    // Busca a configuração bancária para garantir que ela exista
    const config = await tx.configuracaoBancaria.findUnique({
      where: {
        tenantId_banco: {
          tenantId,
          banco,
        },
      },
    });

    if (!config) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Configuração bancária não encontrada para o banco ${banco}. Por favor configure antes de emitir boletos.`,
      });
    }

    // Incrementa o nossoNumeroAtual atomicamente no banco.
    // Esta é a forma recomendada de emular SELECT FOR UPDATE seguro e atômico no Prisma para SQLite e Postgres.
    const updatedConfig = await tx.configuracaoBancaria.update({
      where: {
        id: config.id,
      },
      data: {
        nossoNumeroAtual: {
          increment: 1,
        },
      },
    });

    // Como o update retornará o valor JÁ incrementado, o número gerado para este boleto
    // é o valor anterior do incremento (updatedConfig.nossoNumeroAtual - 1).
    const numeroGerado = updatedConfig.nossoNumeroAtual - 1;

    // Retornamos como string pura (a formatação do banco pode colocar zeros à esquerda depois)
    return numeroGerado.toString();
  });
}
