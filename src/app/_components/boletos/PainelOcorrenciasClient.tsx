"use client";

import { api } from "~/trpc/react";
import { descricaoOcorrencia } from "~/lib/cnab/ocorrencias";

export function PainelOcorrenciasClient() {
  const { data: ocorrencias, refetch, isLoading } = api.boleto.listOcorrencias.useQuery();

  const reemitir = api.boleto.reemitir.useMutation({
    onSuccess: () => refetch(),
    onError: (err: any) => alert("Erro ao reemitir: " + err.message),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Carregando ocorrências...</div>;
  }

  if (!ocorrencias || ocorrencias.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm mt-8">
        <span className="material-symbols-outlined text-emerald-500 mb-4" style={{ fontSize: "48px" }}>check_circle</span>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhuma ocorrência registrada</h3>
        <p className="text-sm text-slate-400 mt-2">Todos os boletos estão com status regular.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Boleto / Cliente</th>
              <th className="px-6 py-4">Banco</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Ocorrência</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ocorrencias.map((b) => (
              <tr key={b.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.cliente.nome}</span>
                    <span className="text-xs text-slate-400">Nosso Nº: {b.nossoNumero}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {b.banco}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{new Date(b.vencimento).toLocaleDateString("pt-BR")}</td>
                <td className="px-6 py-4 text-sm font-bold">
                  {Number(b.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold">
                    <span className="size-1.5 rounded-full bg-rose-500"></span>
                    {descricaoOcorrencia("30")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => reemitir.mutate({ id: b.id })}
                    disabled={reemitir.isPending}
                    title="Reemitir: volta o boleto para PENDENTE para nova remessa"
                    className="px-3 py-1.5 rounded-lg bg-[#ff6e00] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1 ml-auto"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>refresh</span>
                    Reemitir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
