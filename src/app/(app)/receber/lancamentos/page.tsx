import Link from "next/link";
import { ListaLancamentosClient } from "~/app/_components/receber-manual/ListaLancamentosClient";

export const metadata = { title: "Lançamentos Manuais | ERP Financeiro" };

export default function LancamentosPage() {
  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
            <span>Finanças</span>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
            <span>Lançamentos Manuais</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Lançamentos a Receber</h1>
          <p className="text-slate-500">Cobranças via PIX, TED, Dinheiro e outros métodos.</p>
        </div>
        <Link href="/receber/lancamentos/novo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff6e00] text-white font-bold shadow-lg shadow-orange-500/20 hover:opacity-90 text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
          Novo Lançamento
        </Link>
      </div>
      <ListaLancamentosClient />
    </div>
  );
}
