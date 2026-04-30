"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { calcularParcelas, calcularVencimentos } from "~/lib/boleto/parcelamento";

const carneSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  banco: z.enum(["SICOOB", "ITAU"]),
  valorTotal: z.string()
    .min(1, "Informe o valor total do carnê")
    .refine((val) => {
      const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
      return !isNaN(parsed) && parsed > 0;
    }, "Valor inválido"),
  primeiroVencimento: z.string().min(1, "A data da primeira parcela é obrigatória"),
  quantidadeParcelas: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 2 && num <= 12;
  }, "Deve ser de 2 a 12 parcelas"),
  descricao: z.string().optional(),
});

type CarneFormData = z.infer<typeof carneSchema>;

export function NovoCarneForm() {
  const router = useRouter();

  const { data: clientes, isLoading: loadingClientes } = api.cliente.list.useQuery();
  
  const criarCarne = api.boleto.createCarne.useMutation({
    onSuccess: () => {
      router.push("/receber");
      router.refresh();
    },
    onError: (err: any) => {
      alert("Erro ao gerar carnê: " + err.message);
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CarneFormData>({
    resolver: zodResolver(carneSchema),
    defaultValues: {
      banco: "SICOOB",
      quantidadeParcelas: "2",
    },
    mode: "onChange"
  });

  const watchValorTotal = watch("valorTotal");
  const watchParcelas = watch("quantidadeParcelas");
  const watchVencimento = watch("primeiroVencimento");

  const preview = useMemo(() => {
    if (!watchValorTotal || !watchParcelas || !watchVencimento) return null;
    
    const valorNum = parseFloat(watchValorTotal.replace(/\./g, "").replace(",", "."));
    const parcelasNum = parseInt(watchParcelas, 10);
    
    if (isNaN(valorNum) || valorNum <= 0 || isNaN(parcelasNum) || parcelasNum < 2 || parcelasNum > 12) return null;

    const dataOriginal = new Date(watchVencimento + "T12:00:00Z");
    if (isNaN(dataOriginal.getTime())) return null;

    const parcelasValores = calcularParcelas(valorNum, parcelasNum);
    const vencimentosDatas = calcularVencimentos(dataOriginal, parcelasNum);

    return parcelasValores.map((val, idx) => ({
      numero: idx + 1,
      valor: val,
      vencimento: vencimentosDatas[idx],
    }));
  }, [watchValorTotal, watchParcelas, watchVencimento]);

  const onSubmit = (data: CarneFormData) => {
    const numericValue = parseFloat(data.valorTotal.replace(/\./g, "").replace(",", "."));
    const numParcelas = parseInt(data.quantidadeParcelas, 10);
    
    criarCarne.mutate({
      clienteId: data.clienteId,
      valorTotal: numericValue,
      quantidadeParcelas: numParcelas,
      primeiroVencimento: new Date(data.primeiroVencimento + "T12:00:00Z").toISOString(),
      banco: data.banco,
      descricao: data.descricao,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 mx-auto mt-8 flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-xl font-bold">Novo Carnê Parcelado</h3>
          <p className="text-sm text-slate-500">Emissão de múltiplos boletos sequenciais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-2 gap-6">
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
                <option key={c.id} value={c.id}>{c.nome} {c.cpfCnpj ? `- ${c.cpfCnpj}` : ""}</option>
              ))}
            </select>
            {errors.clienteId && <p className="text-rose-500 text-xs mt-1">{errors.clienteId.message}</p>}
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Banco Emissor</label>
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input {...register("banco")} value="SICOOB" type="radio" className="hidden peer" />
              <div className="py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                <span className="text-sm font-bold">Sicoob</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input {...register("banco")} value="ITAU" type="radio" className="hidden peer" />
              <div className="py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                <span className="text-sm font-bold">Itaú</span>
              </div>
            </label>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Valor Total do Carnê</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">R$</span>
            <input
              {...register("valorTotal")}
              type="text"
              placeholder="0,00"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.valorTotal ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
              } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, "");
                if (val.length > 2) val = val.replace(/(\d+)(\d{2})$/, "$1,$2");
                setValue("valorTotal", val, { shouldValidate: true });
              }}
            />
          </div>
          {errors.valorTotal && <p className="text-rose-500 text-xs mt-1">{errors.valorTotal.message}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Qtd. de Parcelas (2 a 12)</label>
          <input
            {...register("quantidadeParcelas")}
            type="number"
            min="2" max="12"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.quantidadeParcelas ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
            } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
          />
          {errors.quantidadeParcelas && <p className="text-rose-500 text-xs mt-1">{errors.quantidadeParcelas.message}</p>}
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-bold mb-2">Vencimento (1ª Parcela)</label>
          <input
            {...register("primeiroVencimento")}
            type="date"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.primeiroVencimento ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
            } bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none`}
          />
          {errors.primeiroVencimento && <p className="text-rose-500 text-xs mt-1">{errors.primeiroVencimento.message}</p>}
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Descrição do Serviço / Produto (Opcional)</label>
          <textarea
            {...register("descricao")}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          ></textarea>
        </div>

        {/* PREVIEW DO PARCELAMENTO */}
        {preview && (
          <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff6e00]" style={{ fontSize: "18px" }}>receipt_long</span>
              Resumo do Carnê
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preview.map((p) => (
                <div key={p.numero} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Parcela {p.numero}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Venc: {p.vencimento!.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center italic">
              * Eventuais diferenças de centavos na divisão são ajustadas na última parcela.
            </p>
          </div>
        )}

        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={criarCarne.isPending}
            className="px-6 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criarCarne.isPending || !isValid}
            className="px-8 py-2.5 rounded-lg bg-[#ff6e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50"
          >
            {criarCarne.isPending ? "Gerando Carnê..." : "Gerar Carnê"}
          </button>
        </div>
      </form>
    </div>
  );
}
