import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { gerarNossoNumero } from "~/lib/boleto/nosso-numero";
import { calcularParcelas, calcularVencimentos } from "~/lib/boleto/parcelamento";

export const boletoRouter = createTRPCRouter({
  countPendentes: protectedProcedure
    .input(z.object({ banco: z.enum(["SICOOB", "ITAU"]) }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      return ctx.db.boleto.count({
        where: { tenantId, banco: input.banco, status: "PENDENTE" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const boleto = await ctx.db.boleto.findFirst({
        where: { id: input.id, tenantId: ctx.session.user.tenantId },
        include: { cliente: true },
      });
      if (!boleto) throw new TRPCError({ code: "NOT_FOUND", message: "Boleto não encontrado" });
      return boleto;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        valor: z.number().positive(),
        vencimento: z.string().datetime() || z.date(),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const boleto = await ctx.db.boleto.findFirst({
        where: { id: input.id, tenantId },
      });

      if (!boleto) throw new TRPCError({ code: "NOT_FOUND", message: "Boleto não encontrado" });
      if (boleto.status !== "PENDENTE") {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Apenas boletos pendentes podem ser editados." 
        });
      }

      return ctx.db.boleto.update({
        where: { id: boleto.id },
        data: {
          valor: input.valor,
          vencimento: new Date(input.vencimento),
          descricao: input.descricao,
        },
      });
    }),

  createAvulso: protectedProcedure
    .input(
      z.object({
        clienteId: z.string(),
        valor: z.number().positive(),
        vencimento: z.string().datetime() || z.date(),
        banco: z.enum(["SICOOB", "ITAU"]),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

      // 1. Gera nosso número seqüencial de forma atômica
      const nossoNumero = await gerarNossoNumero(tenantId, input.banco);

      // 2. Cria o boleto
      const boleto = await ctx.db.boleto.create({
        data: {
          tenantId,
          clienteId: input.clienteId,
          nossoNumero,
          valor: input.valor,
          vencimento: new Date(input.vencimento),
          banco: input.banco,
          status: "PENDENTE",
          descricao: input.descricao,
        },
      });

      return boleto;
    }),

  createCarne: protectedProcedure
    .input(
      z.object({
        clienteId: z.string(),
        valorTotal: z.number().positive(),
        quantidadeParcelas: z.number().int().min(2).max(12),
        primeiroVencimento: z.string().datetime() || z.date(),
        banco: z.enum(["SICOOB", "ITAU"]),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;

      const parcelasValores = calcularParcelas(input.valorTotal, input.quantidadeParcelas);
      const vencimentos = calcularVencimentos(new Date(input.primeiroVencimento), input.quantidadeParcelas);

      // Precisamos garantir que tudo ocorra de forma atômica e que os nosso números sejam gerados sequencialmente.
      return await ctx.db.$transaction(async (tx) => {
        const criados = [];
        
        for (let i = 0; i < input.quantidadeParcelas; i++) {
          const valor = parcelasValores[i]!;
          const vencimento = vencimentos[i]!;
          const parcelaNum = i + 1;

          // TODO: Opcionalmente podemos otimizar e gerar X nosso números em uma única operação.
          // Por enquanto, usaremos a garantia de lock atômico por chamada sequencial
          const config = await tx.configuracaoBancaria.findUnique({
             where: { tenantId_banco: { tenantId, banco: input.banco } }
          });
          if (!config) throw new TRPCError({ code: "BAD_REQUEST", message: `Configuração bancária não encontrada para o banco ${input.banco}.`});

          const updatedConfig = await tx.configuracaoBancaria.update({
             where: { id: config.id },
             data: { nossoNumeroAtual: { increment: 1 }}
          });

          const nossoNumero = (updatedConfig.nossoNumeroAtual - 1).toString();

          const boleto = await tx.boleto.create({
            data: {
              tenantId,
              clienteId: input.clienteId,
              nossoNumero,
              valor,
              vencimento,
              banco: input.banco,
              status: "PENDENTE",
              descricao: input.descricao,
              parcela: parcelaNum,
              totalParcelas: input.quantidadeParcelas,
            },
          });
          criados.push(boleto);
        }

        return criados;
      });
    }),

  listOcorrencias: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session.user;
      return ctx.db.boleto.findMany({
        where: { tenantId, status: "OCORRENCIA" },
        include: { cliente: true },
        orderBy: { updatedAt: "desc" },
      });
    }),

  reemitir: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = ctx.session.user;
      const boleto = await ctx.db.boleto.findFirst({
        where: { id: input.id, tenantId, status: "OCORRENCIA" },
      });
      if (!boleto) throw new TRPCError({ code: "NOT_FOUND", message: "Boleto com ocorrência não encontrado" });
      return ctx.db.boleto.update({
        where: { id: boleto.id },
        data: { status: "PENDENTE" },
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
      const boleto = await ctx.db.boleto.findFirst({
        where: { id: input.id, tenantId, status: { in: ["PENDENTE", "REGISTRADO", "VENCIDO"] } },
      });
      if (!boleto) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Boleto não encontrado ou já pago/cancelado.",
        });
      }
      return ctx.db.boleto.update({
        where: { id: boleto.id },
        data: {
          status: "PAGO",
        },
      });
    }),
});
