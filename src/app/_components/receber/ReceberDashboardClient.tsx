"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useState } from "react";

export function ReceberDashboardClient() {
  const { data, isLoading, refetch } = api.dashboardReceber.getResumo.useQuery();
  const [menuAberto, setMenuAberto] = useState(false);
  const [pagamentoModalConfig, setPagamentoModalConfig] = useState<{ isOpen: boolean; tituloId: string; tipo: "Boleto" | "Lançamento"; dataPagamento: string } | null>(null);

  const pagarBoleto = api.boleto.registrarPagamento.useMutation({
    onSuccess: () => {
      refetch();
      setPagamentoModalConfig(null);
    },
    onError: (e) => alert(e.message)
  });

  const pagarLancamento = api.lancamento.registrarPagamento.useMutation({
    onSuccess: () => {
      refetch();
      setPagamentoModalConfig(null);
    },
    onError: (e) => alert(e.message)
  });

  const isLoadingPagamento = pagarBoleto.isPending || pagarLancamento.isPending;

  const handlePagarAction = (id: string, tipo: string) => {
    setPagamentoModalConfig({
      isOpen: true,
      tituloId: id,
      tipo: tipo as any,
      dataPagamento: new Date().toISOString().substring(0, 16)
    });
  };

  const handleConfirmarPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagamentoModalConfig) return;
    
    // Convert to ISO-8601 full string
    const dataIso = new Date(pagamentoModalConfig.dataPagamento).toISOString();

    if (pagamentoModalConfig.tipo === "Boleto") {
      pagarBoleto.mutate({ id: pagamentoModalConfig.tituloId, dataPagamento: dataIso });
    } else {
      pagarLancamento.mutate({ id: pagamentoModalConfig.tituloId, dataPagamento: dataIso });
    }
  };

  if (isLoading || !data) {
    return <div className="p-8 text-center text-slate-400">Carregando painel financeiro...</div>;
  }

  const { indicadores, titulos } = data;

  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
            <span>Finanças</span>
            <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
            <span>Recebíveis</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Contas a Receber</h1>
          <p className="text-slate-500 dark:text-slate-400">Visão unificada de boletos, carnês e lançamentos manuais.</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#ff6e00] text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-orange-500/20"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              Novo Recebimento
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>keyboard_arrow_down</span>
            </button>
            {menuAberto && (
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                <Link href="/receber/novo-boleto" className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                  Emissão de Boleto
                </Link>
                <Link href="/receber/novo-carne" className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">layers</span>
                  Carnê de Parcelas
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                <Link href="/receber/lancamentos/novo" className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">payments</span>
                  PIX / Manual
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARDS INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 font-bold">Total Previsto</p>
          <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
            {indicadores.totalPrevisto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-400">
          <p className="text-sm text-slate-500 font-bold">Aguardando Pagamento</p>
          <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
            {indicadores.totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-bold">{indicadores.pendentesQtd} títulos pendentes</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-400">
          <p className="text-sm text-slate-500 font-bold">Recebidos (Mês Atual)</p>
          <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
            {indicadores.totalRecebidoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-bold">{indicadores.recebidosMesQtd} transações compensadas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-sm text-slate-500 font-bold">Vencidos / Atrasados</p>
          <p className="text-2xl font-black mt-1 text-rose-500">
            {indicadores.totalVencido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-rose-400 mt-2 font-bold">{indicadores.vencidosQtd} faturas em atraso</p>
        </div>
      </div>

      {/* PAINEL DE AÇÕES EXTRAS (CONCILIAÇÃO / OCORRÊNCIAS / INADIMPLENTES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Link href="/receber/conciliacao" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-emerald-400 transition-colors group">
          <div className="size-10 rounded bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <span className="material-symbols-outlined">sync_alt</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Conciliação CNAB</h4>
            <p className="text-xs text-slate-400 mt-0.5">Gerar Remessa / Processar Retorno</p>
          </div>
        </Link>
        <Link href="/receber/ocorrencias" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-amber-400 transition-colors group">
          <div className="size-10 rounded bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ocorrências</h4>
            <p className="text-xs text-slate-400 mt-0.5">Pendências relatadas pelo banco</p>
          </div>
        </Link>
        <Link href="/receber/inadimplentes" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-rose-400 transition-colors group">
          <div className="size-10 rounded bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors">
            <span className="material-symbols-outlined">gavel</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Inadimplentes</h4>
            <p className="text-xs text-slate-400 mt-0.5">Controle de devedores / Atrasos</p>
          </div>
        </Link>
      </div>

      {/* TABELA UNIFICADA */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">Todos os Títulos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Cliente / Tipo</th>
                <th className="px-6 py-4">Banco/Origem</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {titulos.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-bold">Nenhum título cadastrado</td></tr>
              ) : (
                titulos.map((t) => {
                  const isVencido = (t.status === "PENDENTE" || t.status === "REGISTRADO" || t.status === "OCORRENCIA") && new Date(t.vencimento) < new Date();
                  return (
                    <tr key={`${t.tipo}-${t.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          t.status === "PAGO" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : t.status === "OCORRENCIA" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          : isVencido ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}>
                          <span className="size-1.5 rounded-full bg-current"></span>
                          {t.status === "PAGO" ? "Pago" : t.status === "OCORRENCIA" ? "Erro Bancário" : isVencido ? "Atrasado" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                        {new Date(t.vencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.cliente}</span>
                          <span className="text-xs text-slate-400">{t.descricao}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                          {t.bancoOuMetodo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm">
                        {t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {t.tipo === "Boleto" && (
                          <button
                            onClick={() => window.open(`/api/boletos/${t.id}/pdf`, "_blank")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors text-xs font-bold"
                            title="Imprimir/Baixar Boleto"
                          >
                            <span className="material-symbols-outlined !text-sm">print</span>
                          </button>
                        )}
                        {(t.status === "PENDENTE" || t.status === "REGISTRADO" || isVencido) && (
                          <button
                            onClick={() => handlePagarAction(t.id, t.tipo)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors text-xs font-bold"
                          >
                            <span className="material-symbols-outlined !text-sm">check_circle</span>
                            Receber
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {pagamentoModalConfig?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar Recebimento</h3>
            
            <form onSubmit={handleConfirmarPagamento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 pb-1">Data / Hora do Recebimento</label>
                <input
                  type="datetime-local"
                  required
                  value={pagamentoModalConfig.dataPagamento}
                  onChange={(e) => setPagamentoModalConfig({...pagamentoModalConfig, dataPagamento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPagamentoModalConfig(null)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                  disabled={isLoadingPagamento}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingPagamento}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isLoadingPagamento && <span className="material-symbols-outlined animate-spin !text-sm">sync</span>}
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
