import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const clienteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.cliente.findMany({
      where: { tenantId: ctx.session.user.tenantId },
      orderBy: { nome: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.cliente.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        cpfCnpj: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cliente.create({
        data: {
          ...input,
          email: input.email || undefined,
          tenantId: ctx.session.user.tenantId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          nome: z.string().min(1).optional(),
          cpfCnpj: z.string().optional(),
          email: z.string().email().optional().or(z.literal("")),
          telefone: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Must verify tenant manually before updating
      const cliente = await ctx.db.cliente.findUnique({
        where: { id: input.id },
      });

      if (!cliente || cliente.tenantId !== ctx.session.user.tenantId) {
        throw new Error("Cliente não encontrado ou acesso negado");
      }

      return ctx.db.cliente.update({
        where: { id: input.id },
        data: {
          ...input.data,
          email: input.data.email || undefined,
        },
      });
    }),

  toggleAtivo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cliente = await ctx.db.cliente.findUnique({
        where: { id: input.id },
      });

      if (!cliente || cliente.tenantId !== ctx.session.user.tenantId) {
        throw new Error("Cliente não encontrado ou acesso negado");
      }

      return ctx.db.cliente.update({
        where: { id: input.id },
        data: { ativo: !cliente.ativo },
      });
    }),

  getHistoricoFinanceiro: protectedProcedure
    .input(z.object({ clienteId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Mock data for Story 2.3 until Epic 3/5 implements the real Titulo model
      const mockTitulos = [
        {
          id: "tit-001",
          descricao: "Consultoria Mensal - Jan/2026",
          vencimento: "2026-01-15T00:00:00.000Z",
          valor: 1500.0,
          status: "PAGO",
          metodo: "PIX",
        },
        {
          id: "tit-002",
          descricao: "Consultoria Mensal - Fev/2026",
          vencimento: "2026-02-15T00:00:00.000Z",
          valor: 1500.0,
          status: "PENDENTE",
          metodo: "Boleto",
        },
        {
          id: "tit-003",
          descricao: "Atraso Referência 2025",
          vencimento: "2025-12-10T00:00:00.000Z",
          valor: 850.0,
          status: "VENCIDO",
          metodo: "Boleto",
        },
      ];

      return {
        titulos: mockTitulos,
        resumo: {
          totalPago: 1500.0,
          totalAberto: 1500.0,
          totalVencido: 850.0,
        },
      };
    }),
});

