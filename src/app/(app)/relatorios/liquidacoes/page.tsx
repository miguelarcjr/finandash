"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function LiquidacoesPage() {
  const dataHoje = new Date();
  const primeiroDiaMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1);
  const ultimoDiaMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth() + 1, 0);

  const [dataInicio, setDataInicio] = useState(primeiroDiaMes.toISOString().split("T")[0]!);
  const [dataFim, setDataFim] = useState(ultimoDiaMes.toISOString().split("T")[0]!);

  const { data: liquidacoes, isLoading } = api.dashboard.getLiquidacoes.useQuery({
    dataInicio,
    dataFim,
  });

  const exportToCSV = () => {
    if (!liquidacoes || liquidacoes.length === 0) return;

    // Cabeçalho
    const headers = ["Data", "Cliente", "Valor", "Banco", "Descricao"];
    const separator = ";";

    // Linhas
    const rows = liquidacoes.map((l) => {
      const dataStr = new Date(l.data).toLocaleDateString("pt-BR");
      const clientStr = `"${l.cliente.replace(/"/g, '""')}"`;
      const valStr = l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
      const bancoStr = `"${l.banco || ""}"`;
      const descStr = `"${l.descricao.replace(/"/g, '""')}"`;
      return [dataStr, clientStr, valStr, bancoStr, descStr].join(separator);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(separator) + "\n" + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `liquidacoes_${dataInicio}_ate_${dataFim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
            <span>Relatórios</span>
            <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>
              chevron_right
            </span>
            <span>Liquidações</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Liquidações e Recebimentos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Exportação de dados para contabilidade e conferência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6e00]"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6e00]"
            />
          </div>

          <button
            onClick={exportToCSV}
            disabled={!liquidacoes || liquidacoes.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              download
            </span>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Títulos e Lançamentos Pagos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data Pagamento</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Banco/Origem</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-bold">
                    Carregando...
                  </td>
                </tr>
              ) : !liquidacoes || liquidacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-bold">
                    Nenhuma liquidação no período
                  </td>
                </tr>
              ) : (
                liquidacoes.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {new Date(l.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {l.cliente}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {l.descricao}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                        {l.banco || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {l.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
