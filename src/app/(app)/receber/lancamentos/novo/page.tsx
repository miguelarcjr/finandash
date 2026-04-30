import { LancamentoForm } from "~/app/_components/receber-manual/LancamentoForm";

export const metadata = { title: "Novo Lançamento Manual | ERP Financeiro" };

export default function NovoLancamentoPage() {
  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
          <span>Finanças</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Lançamentos</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Novo</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Lançamento Manual</h1>
        <p className="text-slate-500">Registre cobranças que não passam por boleto bancário.</p>
      </div>
      <LancamentoForm />
    </div>
  );
}
