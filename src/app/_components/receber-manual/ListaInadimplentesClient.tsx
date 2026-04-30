"use client";

import { api } from "~/trpc/react";

export function ListaInadimplentesClient() {
  const { data: inadimplentes, isLoading } = api.lancamento.listInadimplentes.useQuery();

  if (isLoading) return <div className="p-8 text-center text-slate-400">Carregando inadimplentes...</div>;

  if (!inadimplentes || inadimplentes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm mt-8">
        <span className="material-symbols-outlined text-emerald-500 mb-4" style={{ fontSize: "48px" }}>check_circle</span>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhum inadimplente!</h3>
        <p className="text-sm text-slate-400 mt-2">Todos os lançamentos manuais estão em dia.</p>
      </div>
    );
  }

  const totalEmAberto = inadimplentes.reduce((acc, l) => acc + Number(l.valor), 0);
  const diasAtrasoMedio = Math.round(
    inadimplentes.reduce((acc, l) => {
      const dias = Math.floor((Date.now() - new Date(l.vencimento).getTime()) / (1000 * 60 * 60 * 24));
      return acc + dias;
    }, 0) / inadimplentes.length
  );

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">CLIENTES INADIMPLENTES</span>
          <span className="text-3xl font-black text-rose-600">{inadimplentes.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">TOTAL EM ABERTO</span>
          <span className="text-3xl font-black text-rose-600">{totalEmAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">ATRASO MÉDIO</span>
          <span className="text-3xl font-black text-amber-500">{diasAtrasoMedio} dias</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Dias em Atraso</th>
                <th className="px-6 py-4">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {inadimplentes.map((l) => {
                const diasAtraso = Math.floor((Date.now() - new Date(l.vencimento).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={l.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{l.cliente.nome}</span>
                        {l.descricao && <span className="text-xs text-slate-400 line-clamp-1">{l.descricao}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{l.metodo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-rose-600 font-bold">
                      {new Date(l.vencimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${diasAtraso > 30 ? "text-rose-700" : "text-amber-600"}`}>
                        {diasAtraso} dias
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {Number(l.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
