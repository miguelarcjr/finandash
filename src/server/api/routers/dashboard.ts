import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  getKPIs: protectedProcedure
    .input(z.object({ mesAno: z.string().optional() })) // Format: "YYYY-MM"
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      let dateStart, dateEnd;
      if (input.mesAno) {
        const parts = input.mesAno.split("-").map(Number);
        const year = parts[0] || new Date().getFullYear();
        const month = parts[1] || (new Date().getMonth() + 1);
        dateStart = new Date(year, month - 1, 1);
        dateEnd = new Date(year, month, 0, 23, 59, 59, 999);
      } else {
        const now = new Date();
        dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // 1. Previsto a Receber: Boletos e Lançamentos PENDENTES no mês
      const sumBoletosPendentes = await ctx.db.boleto.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          vencimento: { gte: dateStart, lte: dateEnd },
          status: { in: ["PENDENTE", "REGISTRADO", "OCORRENCIA"] },
        },
      });

      const sumLancamentosPendentes = await ctx.db.lancamento.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          vencimento: { gte: dateStart, lte: dateEnd },
          status: "PENDENTE",
        },
      });

      const previstoReceber =
        (Number(sumBoletosPendentes._sum.valor) || 0) +
        (Number(sumLancamentosPendentes._sum.valor) || 0);

      // 2. Realizado (PAGO) no mês
      // Consideramos os que têm status PAGO com updatedAt no mês.
      const sumBoletosPagos = await ctx.db.boleto.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          updatedAt: { gte: dateStart, lte: dateEnd },
          status: "PAGO",
        },
      });

      const sumLancamentosPagos = await ctx.db.lancamento.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          updatedAt: { gte: dateStart, lte: dateEnd },
          status: "PAGO",
        },
      });

      const realizado =
        (Number(sumBoletosPagos._sum.valor) || 0) +
        (Number(sumLancamentosPagos._sum.valor) || 0);

      // 3. Inadimplência: Todos os Vencidos (sem limite de data, para exibir o saldo total em atraso)
      const sumBoletosVencidos = await ctx.db.boleto.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          status: "VENCIDO",
        },
      });
      // Também calculamos boletos pendentes mas com data anterior a hoje
      const sumBoletosAtrasados = await ctx.db.boleto.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          status: { in: ["PENDENTE", "REGISTRADO"] },
          vencimento: { lt: new Date() },
        },
      });
      
      const sumLancAtrasados = await ctx.db.lancamento.aggregate({
         _sum: { valor: true },
         where: {
            tenantId,
            status: "PENDENTE",
            vencimento: { lt: new Date() },
         }
      });

      const inadimplencia =
        (Number(sumBoletosVencidos._sum.valor) || 0) +
        (Number(sumBoletosAtrasados._sum.valor) || 0) +
        (Number(sumLancAtrasados._sum.valor) || 0);

      // 4. Saldo a Pagar: Despesas pendentes do mês
      const sumDespesasPendentes = await ctx.db.despesa.aggregate({
        _sum: { valor: true },
        where: {
          tenantId,
          vencimento: { gte: dateStart, lte: dateEnd },
          status: "PENDENTE",
        },
      });

      const saldoAPagar = Number(sumDespesasPendentes._sum.valor) || 0;

      return {
        previstoReceber,
        realizado,
        inadimplencia,
        saldoAPagar,
        mesReferencia: dateStart.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
      };
    }),

  getCashflowChart: protectedProcedure.query(async ({ ctx }) => {
    // Retorna os últimos 6 meses de fluxo
    const tenantId = ctx.session.user.tenantId;
    const now = new Date();

    const chartData = [];

    // Busca iterativamente os ultimos 6 meses pois no SQLite as funções de data do Prisma limitam os GROUP BYs.
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      // Somar todas as entras (Boletos e Lançamentos) naquele mês
      const bolAggr = await ctx.db.boleto.aggregate({
        _sum: { valor: true },
        where: { tenantId, vencimento: { gte: start, lte: end } },
      });
      const lanAggr = await ctx.db.lancamento.aggregate({
        _sum: { valor: true },
        where: { tenantId, vencimento: { gte: start, lte: end } },
      });

      // Somar saídas
      const despAggr = await ctx.db.despesa.aggregate({
        _sum: { valor: true },
        where: { tenantId, vencimento: { gte: start, lte: end } },
      });

      const receitas =
        (Number(bolAggr._sum.valor) || 0) + (Number(lanAggr._sum.valor) || 0);
      const despesas = Number(despAggr._sum.valor) || 0;

      // Pega o nome do mes: "Jan 23", "Fev 23"...
      const nomeMes = start.toLocaleDateString("pt-BR", {
        month: "short",
      });

      chartData.push({
        mes: nomeMes,
        receitas,
        despesas,
      });
    }

    return chartData;
  }),

  getLiquidacoes: protectedProcedure
    .input(z.object({ dataInicio: z.string(), dataFim: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      const dateStart = new Date(input.dataInicio);
      const dateEnd = new Date(input.dataFim);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);

      const boletosPagos = await ctx.db.boleto.findMany({
        where: {
          tenantId,
          status: "PAGO",
          updatedAt: { gte: dateStart, lte: dateEnd },
        },
        include: { cliente: true },
      });

      const lancamentosPagos = await ctx.db.lancamento.findMany({
        where: {
          tenantId,
          status: "PAGO",
          dataPagamento: { gte: dateStart, lte: dateEnd },
        },
        include: { cliente: true },
      });

      const resultados = [
        ...boletosPagos.map((b) => ({
          id: b.id,
          data: (b.updatedAt || b.vencimento).toISOString(),
          cliente: b.cliente.nome,
          valor: Number(b.valor),
          banco: b.banco,
          descricao: b.descricao || `Boleto N.N ${b.nossoNumero}`,
        })),
        ...lancamentosPagos.map((l) => ({
          id: l.id,
          data: (l.dataPagamento || l.vencimento).toISOString(),
          cliente: l.cliente.nome,
          valor: Number(l.valor),
          banco: l.metodo,
          descricao: l.descricao || "Lançamento Manual",
        })),
      ];

      return resultados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }),
});
