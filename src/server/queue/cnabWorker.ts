import { Worker, Queue } from "bullmq";
import { db } from "~/server/db";
import { parseSicoobRetorno } from "~/lib/cnab/parser-sicoob-retorno";
import { parseItauRetorno } from "~/lib/cnab/parser-itau-retorno";

const redisConnection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
};

export const cnabRetornoQueue = new Queue("cnab-retorno", {
  connection: redisConnection,
});

export interface CnabRetornoJobData {
  tenantId: string;
  banco: "SICOOB" | "ITAU";
  conteudo: string; // Conteúdo texto do arquivo .ret
}

export interface CnabRetornoJobResult {
  pagos: number;
  ocorrencias: number;
  naoEncontrados: number;
}

/**
 * Worker BullMQ que processa arquivos de retorno CNAB de forma assíncrona.
 * Garante idempotência: boletos já com status PAGO não são baixados novamente.
 */
export const cnabRetornoWorker = new Worker<CnabRetornoJobData, CnabRetornoJobResult>(
  "cnab-retorno",
  async (job) => {
    const { tenantId, banco, conteudo } = job.data;

    const registros = banco === "SICOOB"
      ? parseSicoobRetorno(conteudo)
      : parseItauRetorno(conteudo);

    let pagos = 0;
    let ocorrencias = 0;
    let naoEncontrados = 0;

    await db.$transaction(async (tx) => {
      for (const reg of registros) {
        const boleto = await tx.boleto.findFirst({
          where: { nossoNumero: reg.nossoNumero, tenantId, banco },
        });

        if (!boleto) {
          naoEncontrados++;
          continue;
        }

        // Idempotência: já foi baixado, não faz nada
        if (boleto.status === "PAGO") {
          pagos++;
          continue;
        }

        if (reg.isPago) {
          await tx.boleto.update({
            where: { id: boleto.id },
            data: { status: "PAGO" },
          });
          pagos++;
        } else {
          // Registra ocorrência sem mudar o status principal
          await tx.boleto.update({
            where: { id: boleto.id },
            data: { status: "OCORRENCIA" },
          });
          ocorrencias++;
        }
      }
    });

    return { pagos, ocorrencias, naoEncontrados };
  },
  { connection: redisConnection }
);
