import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const despesaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        descricao: z.string().min(1, "A descrição é obrigatória"),
        valor: z.number().positive("O valor deve ser maior que zero"),
        vencimento: z.date(),
        categoria: z.string().min(1, "A categoria é obrigatória"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      return ctx.db.despesa.create({
        data: {
          tenantId,
          descricao: input.descricao,
          valor: input.valor,
          vencimento: input.vencimento,
          categoria: input.categoria,
          status: "PENDENTE",
        },
      });
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          categoria: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      return ctx.db.despesa.findMany({
        where: {
          tenantId,
          status: input?.status ? input.status : undefined,
          categoria: input?.categoria ? input.categoria : undefined,
        },
        orderBy: {
          vencimento: "asc",
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      const despesa = await ctx.db.despesa.findUnique({
        where: { id: input.id },
      });

      if (!despesa || despesa.tenantId !== tenantId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Despesa não encontrada",
        });
      }

      return ctx.db.despesa.delete({
        where: { id: input.id },
      });
    }),

  markAsPaid: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dataPagamento: z.date(),
        formaPagamento: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      const despesa = await ctx.db.despesa.findUnique({
        where: { id: input.id },
      });

      if (!despesa || despesa.tenantId !== tenantId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Despesa não encontrada",
        });
      }

      return ctx.db.despesa.update({
        where: { id: input.id },
        data: {
          status: "PAGO",
          dataPagamento: input.dataPagamento,
          formaPagamento: input.formaPagamento,
        },
      });
    }),
});
