"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";

const boletoSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  banco: z.enum(["SICOOB", "ITAU"]),
  valor: z.string()
    .min(1, "Informe o valor")
    .refine((val) => {
      // accepts format like "1.500,00" or "1500.00"
      const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
      return !isNaN(parsed) && parsed > 0;
    }, "Valor inválido"),
  vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  descricao: z.string().optional(),
});

type BoletoFormData = z.infer<typeof boletoSchema>;

export function NovoBoletoForm() {
  const router = useRouter();
  
  // Queries & Mutations
  const { data: clientes, isLoading: loadingClientes } = api.cliente.list.useQuery();
  const criarBoleto = api.boleto.createAvulso.useMutation({
    onSuccess: () => {
      router.push("/receber");
      router.refresh();
    },
    onError: (err: any) => {
      alert("Erro ao gerar boleto: " + err.message);
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoletoFormData>({
    resolver: zodResolver(boletoSchema),
    defaultValues: {
      banco: "SICOOB",
    },
  });

  const onSubmit = (data: BoletoFormData) => {
    // Parse value string to float
    const numericValue = parseFloat(data.valor.replace(/\./g, "").replace(",", "."));
    
    criarBoleto.mutate({
      clienteId: data.clienteId,
      valor: numericValue,
      vencimento: new Date(data.vencimento).toISOString(),
      banco: data.banco,
      descricao: data.descricao,
    });
  };

  const formBanco = watch("banco");

  return (
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 mx-auto mt-8">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-xl font-bold">Novo Boleto Avulso</h3>
          <p className="text-sm text-slate-500">Emissão de boleto unitário para um cliente</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-2 gap-6">
        {/* CLIENTE */}
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Cliente</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400" style={{ fontSize: "20px" }}>person</span>
            <select
              {...register("clienteId")}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.clienteId ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
              } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none`}
            >
              <option value="">Selecione o cliente cadastrado</option>
              {clientes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.cpfCnpj ? `- ${c.cpfCnpj}` : ""}
                </option>
              ))}
            </select>
            {errors.clienteId && (
              <p className="text-rose-500 text-xs mt-1">{errors.clienteId.message}</p>
            )}
          </div>
          {loadingClientes && <p className="text-xs text-slate-400 mt-1">Carregando clientes...</p>}
        </div>

        {/* BANCO */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Banco Emissor</label>
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input 
                {...register("banco")} 
                value="SICOOB" 
                type="radio" 
                className="hidden peer" 
              />
              <div className="py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                <span className="text-sm font-bold">Sicoob</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input 
                {...register("banco")} 
                value="ITAU" 
                type="radio" 
                className="hidden peer" 
              />
              <div className="py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                <span className="text-sm font-bold">Itaú</span>
              </div>
            </label>
          </div>
          {errors.banco && (
            <p className="text-rose-500 text-xs mt-1">{errors.banco.message}</p>
          )}
        </div>

        {/* VALOR */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Valor Total</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">R$</span>
            <input
              {...register("valor")}
              type="text"
              placeholder="0,00"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.valor ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
              } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
              onChange={(e) => {
                // Simples máscara para dinheiro (opcional, pode ser melhorado com bibliotecas)
                let val = e.target.value.replace(/\D/g, "");
                if (val.length > 2) {
                  val = val.replace(/(\d+)(\d{2})$/, "$1,$2");
                }
                setValue("valor", val);
              }}
            />
          </div>
          {errors.valor && (
            <p className="text-rose-500 text-xs mt-1">{errors.valor.message}</p>
          )}
        </div>

        {/* VENCIMENTO */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Vencimento</label>
          <input
            {...register("vencimento")}
            type="date"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.vencimento ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
            } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
          />
          {errors.vencimento && (
            <p className="text-rose-500 text-xs mt-1">{errors.vencimento.message}</p>
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Descrição do Serviço / Produto (Opcional)</label>
          <textarea
            {...register("descricao")}
            rows={2}
            placeholder="Ex: Mensalidade referente a outubro..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          ></textarea>
        </div>

        <div className="col-span-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>info</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ao confirmar, o boleto será registrado no sistema e ficará aguardando reemissão.
            </p>
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={criarBoleto.isPending}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criarBoleto.isPending}
            className="px-8 py-2.5 rounded-lg bg-[#ff6e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {criarBoleto.isPending ? "Gerando..." : "Gerar Boleto"}
          </button>
        </div>
      </form>
    </div>
  );
}
