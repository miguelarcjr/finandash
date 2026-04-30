"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  valor: z.string().min(1, "Informe o valor").refine(
    (val) => !isNaN(parseFloat(val.replace(/\./g, "").replace(",", "."))) && parseFloat(val.replace(/\./g, "").replace(",", ".")) > 0,
    "Valor inválido"
  ),
  vencimento: z.string().min(1, "Informe o vencimento"),
  metodo: z.enum(["PIX", "TED", "DOC", "DINHEIRO", "CHEQUE"]),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function LancamentoForm() {
  const router = useRouter();
  const { data: clientes, isLoading } = api.cliente.list.useQuery();
  const criar = api.lancamento.create.useMutation({
    onSuccess: () => { router.push("/receber/lancamentos"); router.refresh(); },
    onError: (err: any) => alert("Erro: " + err.message),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { metodo: "PIX" },
  });

  const onSubmit = (data: FormData) => {
    criar.mutate({
      clienteId: data.clienteId,
      valor: parseFloat(data.valor.replace(/\./g, "").replace(",", ".")),
      vencimento: new Date(data.vencimento + "T12:00:00Z").toISOString(),
      metodo: data.metodo,
      descricao: data.descricao,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mx-auto mt-8">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-xl font-bold">Novo Lançamento Manual</h3>
        <p className="text-sm text-slate-500">Registre cobranças via PIX, TED, Dinheiro, etc.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Cliente</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400" style={{ fontSize: "20px" }}>person</span>
            <select {...register("clienteId")}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.clienteId ? "border-rose-500" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-sm outline-none appearance-none`}>
              <option value="">Selecione o cliente</option>
              {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          {errors.clienteId && <p className="text-rose-500 text-xs mt-1">{errors.clienteId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Método de Recebimento</label>
          <select {...register("metodo")} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none">
            {["PIX", "TED", "DOC", "DINHEIRO", "CHEQUE"].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Valor</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">R$</span>
            <input type="text" placeholder="0,00"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.valor ? "border-rose-500" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-sm outline-none`}
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
          <label className="block text-sm font-bold mb-2">Data de Vencimento</label>
          <input {...register("vencimento")} type="date"
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.vencimento ? "border-rose-500" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-sm outline-none`}
          />
          {errors.vencimento && <p className="text-rose-500 text-xs mt-1">{errors.vencimento.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-bold mb-2">Descrição (Opcional)</label>
          <textarea {...register("descricao")} rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none"
            placeholder="Ex: Consultoria mensal - Janeiro 2026..."
          ></textarea>
        </div>

        <div className="col-span-2 flex justify-end gap-3 mt-2">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100">Cancelar</button>
          <button type="submit" disabled={criar.isPending}
            className="px-8 py-2.5 rounded-lg bg-[#ff6e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50">
            {criar.isPending ? "Salvando..." : "Registrar Lançamento"}
          </button>
        </div>
      </form>
    </div>
  );
}
