import { PainelConciliacaoClient } from "~/app/_components/boletos/PainelConciliacaoClient";

export const metadata = {
  title: "Conciliação Bancária | ERP Financeiro",
};

export default function ConciliacaoPage() {
  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
          <span>Finanças</span>
          <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Recebíveis</span>
          <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Centro de Conciliação</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Arquivos CNAB</h1>
        <p className="text-slate-500 dark:text-slate-400">Gere e faça o download dos arquivos de remessa posicional para envio aos bancos.</p>
      </div>

      <PainelConciliacaoClient />
    </div>
  );
}
