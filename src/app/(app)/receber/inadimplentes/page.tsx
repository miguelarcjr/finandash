import { ListaInadimplentesClient } from "~/app/_components/receber-manual/ListaInadimplentesClient";

export const metadata = { title: "Inadimplentes | ERP Financeiro" };

export default function InadimplentesPage() {
  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
          <span>Finanças</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Inadimplentes</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Lista de Inadimplentes</h1>
        <p className="text-slate-500">Lançamentos manuais com vencimento ultrapassado e ainda não pagos.</p>
      </div>
      <ListaInadimplentesClient />
    </div>
  );
}
