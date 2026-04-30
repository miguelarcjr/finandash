import { z } from "zod";
import { createTRPCRouter, roleProcedure } from "~/server/api/trpc";
import { encrypt, decrypt } from "~/lib/encryption";

export const configuracaoBancariaRouter = createTRPCRouter({
  getConfig: roleProcedure(["SOCIO", "FINANCEIRO"])
    .input(z.object({ banco: z.enum(["SICOOB", "ITAU"]) }))
    .query(async ({ ctx, input }) => {
      const config = await ctx.db.configuracaoBancaria.findUnique({
        where: {
          tenantId_banco: {
            tenantId: ctx.session.user.tenantId,
            banco: input.banco,
          },
        },
      });

      if (!config) return null;

      return {
        ...config,
        agencia: config.agencia ? decrypt(config.agencia) : null,
        conta: config.conta ? decrypt(config.conta) : null,
        convenio: config.convenio ? decrypt(config.convenio) : null,
      };
    }),

  upsertConfig: roleProcedure(["SOCIO", "FINANCEIRO"])
    .input(z.object({
      banco: z.enum(["SICOOB", "ITAU"]),
      agencia: z.string().optional(),
      conta: z.string().optional(),
      convenio: z.string().optional(),
      nossoNumeroInicial: z.number().int().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const agencia = input.agencia ? encrypt(input.agencia) : undefined;
      const conta = input.conta ? encrypt(input.conta) : undefined;
      const convenio = input.convenio ? encrypt(input.convenio) : undefined;

      const config = await ctx.db.configuracaoBancaria.upsert({
        where: {
          tenantId_banco: {
            tenantId: ctx.session.user.tenantId,
            banco: input.banco,
          },
        },
        update: {
          agencia,
          conta,
          convenio,
          ...(input.nossoNumeroInicial !== undefined ? { nossoNumeroInicial: input.nossoNumeroInicial } : {}),
        },
        create: {
          tenantId: ctx.session.user.tenantId,
          banco: input.banco,
          agencia,
          conta,
          convenio,
          nossoNumeroInicial: input.nossoNumeroInicial ?? 1,
          nossoNumeroAtual: input.nossoNumeroInicial ?? 1,
        },
      });

      return config;
    }),
});
