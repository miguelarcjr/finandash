"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import { NovaDespesaModal } from "./NovaDespesaModal";

export function PagarDashboardClient() {
  const { data: despesas, isLoading, refetch } = api.despesa.list.useQuery();
  const markAsPaid = api.despesa.markAsPaid.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [isNovaDespesaOpen, setIsNovaDespesaOpen] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Carregando painel financeiro...</div>;
  }

  // Calculates data for the banner (tasks near to expire / alert)
  const agora = new Date();
  const proximasAvencer = despesas?.filter(d => {
    if (d.status === "PAGO" || d.status === "CANCELADO") return false;
    const v = new Date(d.vencimento);
    const diffTime = v.getTime() - agora.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }) || [];

  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      {/* ALERTA DE VENCIMENTO (Story 6.3) */}
      {proximasAvencer.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-rose-500">warning</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-800">Atenção! Vencimentos Próximos ou Atrasados</h4>
            <p className="text-xs text-rose-600 font-medium mt-0.5">
              Você possui {proximasAvencer.length} conta(s) vencendo nos próximos 3 dias ou já vencidas.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
            <span>Finanças</span>
            <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
            <span>A Pagar</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Contas a Pagar</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestão de despesas e aprovação de pagamentos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsNovaDespesaOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#ff6e00] text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-orange-500/20"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
            Nova Despesa
          </button>
        </div>
      </div>

      {/* TABELA DE DESPESAS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">Todas as Despesas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Descrição / Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!despesas || despesas.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-bold">Nenhuma despesa cadastrada</td></tr>
              ) : (
                despesas.map((d) => {
                  const dataVencimento = new Date(d.vencimento);
                  const isVencido = d.status === "PENDENTE" && dataVencimento < agora;
                  
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          d.status === "PAGO" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : d.status === "CANCELADO" ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          : isVencido ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}>
                          <span className="size-1.5 rounded-full bg-current"></span>
                          {d.status === "PAGO" ? "Pago" : d.status === "CANCELADO" ? "Cancelado" : isVencido ? "Atrasado" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                        {dataVencimento.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.descricao}</span>
                          <span className="text-xs text-slate-400">{d.categoria}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm">
                        {Number(d.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {d.status === "PENDENTE" && (
                          <button
                            onClick={() => {
                              if (confirm("Deseja marcar esta despesa como paga na data de hoje?")) {
                                markAsPaid.mutate({
                                  id: d.id,
                                  dataPagamento: new Date(),
                                  formaPagamento: "PIX/Transferência", // Padronizado para o exemplo rápido
                                });
                              }
                            }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Pagar
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

      {isNovaDespesaOpen && (
        <NovaDespesaModal 
          onClose={() => setIsNovaDespesaOpen(false)} 
          onSuccess={() => {
            setIsNovaDespesaOpen(false);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
