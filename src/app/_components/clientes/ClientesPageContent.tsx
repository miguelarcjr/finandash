"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { ClienteModal } from "./ClienteModal";
import { Plus, Search, Eye, MoreVertical, Edit2, AlertOctagon, CheckCircle2 } from "lucide-react";

export function ClientesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: clientes, isLoading } = api.cliente.list.useQuery();
  const utils = api.useUtils();

  const toggleAtivoMutation = api.cliente.toggleAtivo.useMutation({
    onSuccess: () => {
      void utils.cliente.list.invalidate();
    },
  });

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleToggleAtivo = (id: string) => {
    toggleAtivoMutation.mutate({ id });
  };

  const openNewModal = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const ativos = clientes?.filter((c: any) => c.ativo) || [];
  const inativos = clientes?.filter((c: any) => !c.ativo) || [];

  return (
    <div className="flex flex-col gap-6">
      {successMessage && (
        <div className="px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800">
            Cadastro de Clientes
          </h2>
          <p className="text-slate-500 text-sm">
            Gerencie dados cadastrais e o fluxo de clientes da sua base.
          </p>
        </div>

        <button 
          onClick={openNewModal}
          className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="size-5" />
          Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Total Clientes</p>
          <p className="text-2xl font-black text-slate-900">{clientes?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Ativos</p>
          <p className="text-2xl font-black text-emerald-600">{ativos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase">Inativos</p>
          <p className="text-2xl font-black text-slate-400">{inativos.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="flex w-full items-stretch rounded-lg h-10 border border-slate-200 bg-slate-50">
              <div className="text-slate-400 flex items-center justify-center pl-3">
                <Search className="size-5" />
              </div>
              <input
                className="flex w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 px-3"
                placeholder="Busca desativada..."
                disabled
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Carregando clientes...
                  </td>
                </tr>
              ) : ativos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum cliente ativo encontrado.
                  </td>
                </tr>
              ) : (
                ativos.map((cliente: any) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{cliente.nome}</p>
                          <p className="text-xs text-slate-500">{cliente.email || "Sem e-mail"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{cliente.cpfCnpj || "-"}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                        Ativo
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <a 
                          href={`/clientes/${cliente.id}`}
                          className="text-slate-400 hover:text-primary hover:bg-slate-50 p-2 rounded-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="size-4" />
                        </a>
                        <button 
                          onClick={() => handleEdit(cliente)}
                          className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleAtivo(cliente.id)}
                          disabled={toggleAtivoMutation.isPending}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          title="Inativar"
                        >
                          <AlertOctagon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClienteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clienteAEditar={editingCliente}
        onSuccess={() => {
          setSuccessMessage(editingCliente ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
          setTimeout(() => setSuccessMessage(""), 5000);
        }}
      />
    </div>
  );
}
