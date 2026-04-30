"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface NovaDespesaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovaDespesaModal({ onClose, onSuccess }: NovaDespesaModalProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  const createDespesa = api.despesa.create.useMutation({
    onSuccess: () => {
      setLoading(false);
      onSuccess();
    },
    onError: () => {
      setLoading(false);
      alert("Erro ao criar despesa.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const valorNum = parseFloat(valor.replace(",", "."));
    const vencData = new Date(vencimento);

    if (isNaN(valorNum) || isNaN(vencData.getTime())) {
      alert("Valores inválidos");
      setLoading(false);
      return;
    }

    createDespesa.mutate({
      descricao,
      valor: valorNum,
      vencimento: vencData,
      categoria,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nova Despesa</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição</label>
            <input 
              required
              type="text" 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6e00]/20 focus:border-[#ff6e00] transition-all"
              placeholder="Ex: Aluguel do Escritório"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Valor (R$)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6e00]/20 focus:border-[#ff6e00] transition-all"
                placeholder="0,00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Vencimento</label>
              <input 
                required
                type="date" 
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6e00]/20 focus:border-[#ff6e00] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</label>
            <select 
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6e00]/20 focus:border-[#ff6e00] transition-all"
            >
              <option value="" disabled>Selecione uma categoria...</option>
              <option value="Impostos">Impostos</option>
              <option value="Folha de Pagamento">Folha de Pagamento</option>
              <option value="Infraestrutura">Infraestrutura</option>
              <option value="Marketing">Marketing</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#ff6e00] hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Despesa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
