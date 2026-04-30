"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const METODO_ICONS: Record<string, string> = {
  PIX: "pix",
  TED: "swap_horiz",
  DOC: "description",
  DINHEIRO: "payments",
  CHEQUE: "receipt_long",
};

export function ListaLancamentosClient() {
  const { data: lancamentos, refetch, isLoading } = api.lancamento.list.useQuery();
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().split("T")[0]!);

  const registrar = api.lancamento.registrarPagamento.useMutation({
    onSuccess: () => { setPagandoId(null); refetch(); },
    onError: (err: any) => alert("Erro: " + err.message),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Carregando...</div>;

  if (!lancamentos || lancamentos.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm mt-8">
        <span className="material-symbols-outlined text-slate-300 mb-4" style={{ fontSize: "48px" }}>receipt_long</span>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhum lançamento cadastrado</h3>
        <p className="text-sm text-slate-400 mt-2">Clique em "Novo Lançamento" para começar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {lancamentos.map((l) => {
              const isPago = l.status === "PAGO";
              const isVencido = !isPago && new Date(l.vencimento) < new Date();
              return (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{l.cliente.nome}</span>
                      {l.descricao && <span className="text-xs text-slate-400 line-clamp-1">{l.descricao}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{METODO_ICONS[l.metodo] ?? "payments"}</span>
                      {l.metodo}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${isVencido ? "text-rose-600 font-bold" : ""}`}>
                    {new Date(l.vencimento).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    {Number(l.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isPago ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                             : isVencido ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                             : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}>
                      <span className="size-1.5 rounded-full bg-current"></span>
                      {isPago ? "Pago" : isVencido ? "Vencido" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!isPago && (
                      pagandoId === l.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <input type="date" value={dataPagamento} onChange={e => setDataPagamento(e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                          />
                          <button onClick={() => registrar.mutate({ id: l.id, dataPagamento: new Date(dataPagamento + "T12:00:00Z").toISOString() })}
                            disabled={registrar.isPending}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50">
                            Confirmar
                          </button>
                          <button onClick={() => setPagandoId(null)} className="px-3 py-1.5 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setPagandoId(l.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#ff6e00] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1 ml-auto">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>
                          Registrar Pagamento
                        </button>
                      )
                    )}
                    {isPago && (
                      <span className="text-xs text-slate-400">
                        Pago em {l.dataPagamento ? new Date(l.dataPagamento).toLocaleDateString("pt-BR") : "-"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
