"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [mesAno, setMesAno] = useState<string>(""); // YYYY-MM

  const { data: kpis, isLoading: isLoadingKPIs } = api.dashboard.getKPIs.useQuery({
    mesAno: mesAno || undefined,
  });

  const { data: chartData, isLoading: isLoadingChart } = api.dashboard.getCashflowChart.useQuery();

  if (isLoadingKPIs || isLoadingChart) {
    return <div className="p-8 text-center text-slate-400">Carregando indicadores...</div>;
  }

  const { previstoReceber = 0, realizado = 0, inadimplencia = 0, saldoAPagar = 0, mesReferencia = "" } = kpis || {};

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Visão Geral Financeira
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Acompanhamento de performance e saúde financeira — <strong className="capitalize">{mesReferencia}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Competência:</label>
          <input 
            type="month" 
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6e00]"
          />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-blue-400">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Previsto a Receber</span>
          </div>
          <p className="text-2xl font-black tracking-tight">{previstoReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">No mês filtrado</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Realizado</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {realizado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Pago / Recebido</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-rose-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Inadimplência</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {inadimplencia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Total em Vencidos</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-amber-400">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-500">Saldo a Pagar</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-500">
            {saldoAPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Despesas pendentes do mês</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Fluxo de Receitas vs. Despesas</h3>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 12 }} 
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm font-medium text-slate-400">
                Nenhum dado disponível.
              </div>
            )}
          </div>
        </div>

        {/* Side Panel Placeholder */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-100">Recomendações</h3>
          <div className="flex-1 flex flex-col gap-4">
            {inadimplencia > 0 && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-400 mb-1">Atenção Inadimplência</p>
                <p className="text-xs text-rose-600 dark:text-rose-500">
                  O saldo de inadimplentes está em {inadimplencia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}. Acompanhe na aba Retorno CNAB.
                </p>
              </div>
            )}
            {saldoAPagar > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Pagamentos Pendentes</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Verifique suas despesas pendentes no módulo Contas a Pagar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
