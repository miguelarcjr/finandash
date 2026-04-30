import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const lancamentoRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.lancamento.findMany({
      where: { tenantId: ctx.session.user.tenantId },
      include: { cliente: true },
      orderBy: { vencimento: "asc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        clienteId: z.string().min(1),
        valor: z.number().positive(),
        vencimento: z.string().datetime(),
        metodo: z.enum(["PIX", "TED", "DOC", "DINHEIRO", "CHEQUE"]),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      return ctx.db.lancamento.create({
        data: {
          tenantId,
          clienteId: input.clienteId,
          valor: input.valor,
          vencimento: new Date(input.vencimento),
          metodo: input.metodo,
          descricao: input.descricao,
          status: "PENDENTE",
        },
      });
    }),

  registrarPagamento: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        dataPagamento: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const lancamento = await ctx.db.lancamento.findFirst({
        where: { id: input.id, tenantId, status: "PENDENTE" },
      });
      if (!lancamento) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lançamento não encontrado ou já pago.",
        });
      }
      return ctx.db.lancamento.update({
        where: { id: lancamento.id },
        data: {
          status: "PAGO",
          dataPagamento: new Date(input.dataPagamento),
        },
      });
    }),

  listInadimplentes: protectedProcedure.query(async ({ ctx }) => {
    const hoje = new Date();
    return ctx.db.lancamento.findMany({
      where: {
        tenantId: ctx.session.user.tenantId,
        status: "PENDENTE",
        vencimento: { lt: hoje },
      },
      include: { cliente: true },
      orderBy: { vencimento: "asc" },
    });
  }),
});
