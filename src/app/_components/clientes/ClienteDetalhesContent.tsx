"use client";

import { api } from "~/trpc/react";
import { ArrowLeft, FileText, CheckCircle2, Clock, AlertCircle, AlertOctagon, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ClienteDetalhesContent() {
  const params = useParams();
  const clienteId = params.id as string;

  const { data: cliente, isLoading: loadingCliente } = api.cliente.getById.useQuery({ id: clienteId });
  const { data: historico, isLoading: loadingHistorico } = api.cliente.getHistoricoFinanceiro.useQuery({ clienteId });

  if (loadingCliente || loadingHistorico) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes do cliente...</div>;
  }

  if (!cliente) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <AlertCircle className="size-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Cliente não encontrado</h2>
        <Link href="/clientes" className="text-primary mt-4 hover:underline">Voltar para clientes</Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAGO":
        return <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 className="size-3" /> Pago</span>;
      case "PENDENTE":
        return <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase flex items-center gap-1"><Clock className="size-3" /> Pendente</span>;
      case "VENCIDO":
        return <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-[10px] font-bold uppercase flex items-center gap-1"><AlertCircle className="size-3" /> Vencido</span>;
      case "REGISTRADO":
        return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase flex items-center gap-1"><Info className="size-3" /> Registrado</span>;
      case "OCORRENCIA":
        return <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase flex items-center gap-1"><AlertOctagon className="size-3" /> Ocorrência</span>;
      default:
        return <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/clientes" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors w-min whitespace-nowrap">
          <ArrowLeft className="size-4" /> Voltar para Lista
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{cliente.nome}</h2>
              <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-500">
                {cliente.email && <span>{cliente.email}</span>}
                {cliente.cpfCnpj && <span>Doc: {cliente.cpfCnpj}</span>}
                {cliente.telefone && <span>Tel: {cliente.telefone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cliente.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {cliente.ativo ? "Ativo" : "Inativo"}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <FileText className="size-6 text-primary" />
          Detalhamento de Títulos
        </h3>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">HISTÓRICO COMPLETO</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Total Recebido</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(historico?.resumo?.totalPago || 0)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Em Aberto</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(historico?.resumo?.totalAberto || 0)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Vencido</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(historico?.resumo?.totalVencido || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!historico?.titulos || historico.titulos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                    Nenhum lançamento encontrado para este cliente.
                  </td>
                </tr>
              ) : (
                historico.titulos.map((titulo: any) => (
                  <tr key={titulo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{formatDate(titulo.vencimento)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{titulo.descricao}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{formatCurrency(titulo.valor)}</td>
                    <td className="px-6 py-4">{getStatusBadge(titulo.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{titulo.metodo}</td>
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
