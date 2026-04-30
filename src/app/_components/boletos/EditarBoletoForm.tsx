"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";

const editBoletoSchema = z.object({
  valor: z.string()
    .min(1, "Informe o valor")
    .refine((val) => {
      const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
      return !isNaN(parsed) && parsed > 0;
    }, "Valor inválido"),
  vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  descricao: z.string().optional(),
});

type EditBoletoFormData = z.infer<typeof editBoletoSchema>;

interface Props {
  boletoId: string;
}

export function EditarBoletoForm({ boletoId }: Props) {
  const router = useRouter();
  
  const { data: boleto, isLoading } = api.boleto.getById.useQuery({ id: boletoId });
  const editarBoleto = api.boleto.update.useMutation({
    onSuccess: () => {
      router.push("/receber");
    },
    onError: (err: any) => {
      alert("Erro ao editar boleto: " + err.message);
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<EditBoletoFormData>({
    resolver: zodResolver(editBoletoSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if (boleto) {
      const valorFormatado = Number(boleto.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      reset({
        valor: valorFormatado,
        vencimento: new Date(boleto.vencimento).toISOString().split('T')[0],
        descricao: boleto.descricao || "",
      });
    }
  }, [boleto, reset]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>;
  if (!boleto) return <div className="p-8 text-center text-rose-500">Boleto não encontrado.</div>;
  if (boleto.status !== 'PENDENTE') {
    return (
      <div className="p-8 text-centerbg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl mt-8">
        <h3 className="font-bold text-lg">Boleto não pode ser editado</h3>
        <p className="text-sm mt-2">Apenas boletos com status <strong>PENDENTE</strong> podem ser alterados.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm hover:bg-amber-200"
        >
          Voltar
        </button>
      </div>
    );
  }

  const onSubmit = (data: EditBoletoFormData) => {
    const numericValue = parseFloat(data.valor.replace(/\./g, "").replace(",", "."));
    
    editarBoleto.mutate({
      id: boletoId,
      valor: numericValue,
      vencimento: new Date(data.vencimento + "T12:00:00Z").toISOString(),
      descricao: data.descricao,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 mx-auto mt-8 flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-xl font-bold">Editar Boleto</h3>
          <p className="text-sm text-slate-500">
            Atualize o valor, vencimento ou descrição de um boleto pendente.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-2 gap-6">
        
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Cliente</label>
          <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
            {boleto.cliente.nome} (Não alterável)
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Banco Emissor</label>
          <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
            {boleto.banco} (Não alterável)
          </div>
        </div>
        
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Nosso Número</label>
          <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
            {boleto.nossoNumero} (Não alterável)
          </div>
        </div>

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
                let val = e.target.value.replace(/\D/g, "");
                if (val.length > 2) val = val.replace(/(\d+)(\d{2})$/, "$1,$2");
                setValue("valor", val, { shouldValidate: true });
              }}
            />
          </div>
          {errors.valor && <p className="text-rose-500 text-xs mt-1">{errors.valor.message}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Vencimento</label>
          <input
            {...register("vencimento")}
            type="date"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.vencimento ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
            } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
          />
          {errors.vencimento && <p className="text-rose-500 text-xs mt-1">{errors.vencimento.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Descrição do Serviço / Produto (Opcional)</label>
          <textarea
            {...register("descricao")}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          ></textarea>
        </div>

        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={editarBoleto.isPending}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={editarBoleto.isPending || !isValid}
            className="px-8 py-2.5 rounded-lg bg-[#ff6e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50"
          >
            {editarBoleto.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
