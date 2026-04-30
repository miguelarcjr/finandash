"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Save, Building2, Hash, Edit3 } from "lucide-react";

type Banco = "SICOOB" | "ITAU";

export default function BancosPage() {
  const [bancoSelecionado, setBancoSelecionado] = useState<Banco>("SICOOB");
  const [formData, setFormData] = useState({
    agencia: "",
    conta: "",
    convenio: "",
    nossoNumeroInicial: 1
  });

  const { data: configRecebida, isLoading, refetch } = api.configuracaoBancaria.getConfig.useQuery(
    { banco: bancoSelecionado },
    { refetchOnWindowFocus: false }
  );

  const upsertMutation = api.configuracaoBancaria.upsertConfig.useMutation({
    onSuccess: () => {
      alert("Configuração salva com sucesso!");
      refetch();
    },
    onError: (e) => {
      alert("Erro ao salvar: " + e.message);
    }
  });

  useEffect(() => {
    if (configRecebida) {
      setFormData({
        agencia: configRecebida.agencia || "",
        conta: configRecebida.conta || "",
        convenio: configRecebida.convenio || "",
        nossoNumeroInicial: configRecebida.nossoNumeroAtual || configRecebida.nossoNumeroInicial || 1
      });
    } else {
      setFormData({
        agencia: "",
        conta: "",
        convenio: "",
        nossoNumeroInicial: 1
      });
    }
  }, [configRecebida]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      banco: bancoSelecionado,
      ...formData
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">Bancos e Boletos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">Selecione o Banco</h3>
            </div>
            <div className="p-2 flex flex-col space-y-1">
              <button
                onClick={() => setBancoSelecionado("SICOOB")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${bancoSelecionado === "SICOOB" ? "bg-orange-50 text-[#ff6e00]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bancoSelecionado === "SICOOB" ? "bg-orange-100 text-[#ff6e00]" : "bg-gray-100"}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-medium">Sicoob</span>
              </button>
              
              <button
                onClick={() => setBancoSelecionado("ITAU")}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${bancoSelecionado === "ITAU" ? "bg-orange-50 text-[#ff6e00]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bancoSelecionado === "ITAU" ? "bg-orange-100 text-[#ff6e00]" : "bg-gray-100"}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-medium">Itaú</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Configuração {bancoSelecionado}</h3>
              <p className="text-sm text-gray-500 mt-1">Preencha os dados bancários para emissão de boletos e CNAB.</p>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Carregando configurações...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 pb-1">Agência</label>
                      <input
                        type="text"
                        value={formData.agencia}
                        onChange={(e) => setFormData({...formData, agencia: e.target.value})}
                        className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="Ex: 1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 pb-1">Conta Corrente</label>
                      <input
                        type="text"
                        value={formData.conta}
                        onChange={(e) => setFormData({...formData, conta: e.target.value})}
                        className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="Ex: 12345-6"
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 pb-1">Código do Convênio (Beneficiário)</label>
                     <input
                       type="text"
                       value={formData.convenio}
                       onChange={(e) => setFormData({...formData, convenio: e.target.value})}
                       className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                       placeholder="Ex: 1234567"
                     />
                     <p className="mt-1 text-xs text-gray-500">Fornecido pelo banco ao homologar o convênio.</p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <Hash className="w-5 h-5 mr-2 text-gray-400" />
                      Sequencial de Boletos
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 pb-1">Nosso Número Inicial / Atual</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.nossoNumeroInicial}
                        onChange={(e) => setFormData({...formData, nossoNumeroInicial: parseInt(e.target.value) || 1})}
                        className="focus:ring-[#ff6e00] focus:border-[#ff6e00] block w-48 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      />
                      <p className="mt-1 text-xs text-orange-600 flex items-center">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Cuidado: Alterar este valor se você já emitia boletos pode causar duplicidade de 'Nosso Número'.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={upsertMutation.isPending}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-[#ff6e00] text-sm font-medium text-white hover:bg-[#e66300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6e00] disabled:opacity-50"
                    >
                      {upsertMutation.isPending ? "Salvando..." : (
                        <><Save className="w-4 h-4 mr-2" /> Salvar Configurações</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
