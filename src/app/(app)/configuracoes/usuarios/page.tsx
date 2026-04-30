"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Plus, Edit2, KeyRound, ShieldBan, ShieldCheck, Mail, User } from "lucide-react";

export default function UsuariosPage() {
  const { data: usuarios, refetch, isLoading } = api.usuario.list.useQuery();
  
  const createMutation = api.usuario.create.useMutation({
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      resetForm();
    },
    onError: (e) => alert(e.message)
  });

  const updateMutation = api.usuario.update.useMutation({
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      resetForm();
    },
    onError: (e) => alert(e.message)
  });

  const toggleStatusMutation = api.usuario.toggleStatus.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => alert(e.message)
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "FINANCEIRO" });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", password: "", role: "FINANCEIRO" });
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({ name: user.name || "", email: user.email, password: "", role: user.role });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, name: formData.name, role: formData.role as any });
    } else {
      createMutation.mutate({ ...formData, role: formData.role as any });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">Usuários</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#ff6e00] text-white hover:bg-[#e66300] h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome / E-mail</th>
                  <th scope="col" className="px-6 py-3">Papel</th>
                  <th scope="col" className="px-6 py-3">Situação</th>
                  <th scope="col" className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios?.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.ativo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ShieldBan className="w-3 h-3 mr-1" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => handleOpenEdit(user)} className="text-gray-500 hover:text-gray-700">
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => toggleStatusMutation.mutate({ id: user.id, ativo: !user.ativo })}
                         className={`${user.ativo ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
                         title={user.ativo ? "Inativar" : "Ativar"}
                       >
                         {user.ativo ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                       </button>
                    </td>
                  </tr>
                ))}
                {usuarios?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? "Editar Usuário" : "Novo Usuário"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={!!editingId}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border disabled:bg-gray-100"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Papel (Role) <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ff6e00] focus:border-[#ff6e00] sm:text-sm rounded-md border text-gray-900 bg-white"
                >
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="CONTADOR">Contador</option>
                  <option value="SOCIO">Sócio</option>
                </select>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#ff6e00] text-base font-medium text-white hover:bg-[#e66300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6e00] sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6e00] sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
