import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardReceberRouter = createTRPCRouter({
  getResumo: protectedProcedure.query(async ({ ctx }) => {
    const { tenantId } = ctx.session.user;

    const dataAtual = new Date();
    const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const fimMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

    // Buscar Boletos
    const boletos = await ctx.db.boleto.findMany({
      where: { tenantId },
      include: { cliente: true },
    });

    // Buscar Lançamentos Manuais
    const lancamentos = await ctx.db.lancamento.findMany({
      where: { tenantId },
      include: { cliente: true },
    });

    // Unificar em um array "Titulos" (Boleto ou Lancamento)
    const todosTitulos = [
      ...boletos.map((b) => ({
        id: b.id,
        tipo: "Boleto",
        cliente: b.cliente.nome,
        descricao: b.descricao || "Emissão de Boleto/Carnê",
        valor: Number(b.valor),
        vencimento: b.vencimento,
        status: b.status,
        bancoOuMetodo: b.banco,
      })),
      ...lancamentos.map((l) => ({
        id: l.id,
        tipo: "Lançamento",
        cliente: l.cliente.nome,
        descricao: l.descricao || "Lançamento Manual",
        valor: Number(l.valor),
        vencimento: l.vencimento,
        status: l.status,
        bancoOuMetodo: l.metodo,
      })),
    ].sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

    // Calculando Indicadores
    let totalPrevisto = 0;
    let totalPendente = 0;
    let pendentesQtd = 0;
    let totalRecebidoMes = 0;
    let recebidosMesQtd = 0;
    let totalVencido = 0;
    let vencidosQtd = 0;

    for (const t of todosTitulos) {
      totalPrevisto += t.valor;

      if (t.status === "PENDENTE" || t.status === "REGISTRADO" || t.status === "OCORRENCIA") {
        if (new Date(t.vencimento) < dataAtual) {
          totalVencido += t.valor;
          vencidosQtd++;
        } else {
          totalPendente += t.valor;
          pendentesQtd++;
        }
      }

      if (t.status === "PAGO") {
        if (new Date(t.vencimento) >= inicioMes && new Date(t.vencimento) <= fimMes) {
          totalRecebidoMes += t.valor;
          recebidosMesQtd++;
        }
      }
    }

    return {
      indicadores: {
        totalPrevisto,
        totalPendente,
        pendentesQtd,
        totalRecebidoMes,
        recebidosMesQtd,
        totalVencido,
        vencidosQtd,
      },
      titulos: todosTitulos,
    };
  }),
});
