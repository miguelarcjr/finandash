import { EditarBoletoForm } from "~/app/_components/boletos/EditarBoletoForm";

export const metadata = {
  title: "Editar Boleto | ERP Financeiro",
};

export default async function EditarBoletoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#ff6e00] font-medium text-sm">
          <span>Finanças</span>
          <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Recebíveis</span>
          <span className="material-symbols-outlined !text-sm" style={{ fontSize: "14px" }}>chevron_right</span>
          <span>Editar Boleto</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Editar Vencimento/Valor</h1>
        <p className="text-slate-500 dark:text-slate-400">Corriga eventuais erros de um boleto antes de gerar a remessa para o banco.</p>
      </div>

      <EditarBoletoForm boletoId={id} />
    </div>
  );
}
