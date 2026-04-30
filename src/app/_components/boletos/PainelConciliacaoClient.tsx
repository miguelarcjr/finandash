"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";

export function PainelConciliacaoClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ jobId: string; mensagem: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bancoSelecionado, setBancoSelecionado] = useState<"SICOOB" | "ITAU">("SICOOB");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: sicoobCount } = api.boleto.countPendentes.useQuery({ banco: "SICOOB" });
  const { data: itauCount } = api.boleto.countPendentes.useQuery({ banco: "ITAU" });

  const handleDownload = async (banco: "SICOOB" | "ITAU") => {
    try {
      setLoading(banco);
      const response = await fetch(`/api/cnab/remessa?banco=${banco}`, { method: "GET" });
      if (!response.ok) {
        let msg = "Erro desconhecido";
        try { msg = await response.text(); } catch { }
        alert(msg);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `REM_${banco}_${new Date().getTime()}.rem`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Falha de rede ao tentar baixar o arquivo.");
    } finally {
      setLoading(null);
    }
  };

  const handleUploadRetorno = async () => {
    const arquivo = fileRef.current?.files?.[0];
    if (!arquivo) {
      setUploadError("Selecione um arquivo .ret para continuar.");
      return;
    }
    setUploadLoading(true);
    setUploadResult(null);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      formData.append("banco", bancoSelecionado);
      const response = await fetch("/api/cnab/retorno", { method: "POST", body: formData });
      if (!response.ok) {
        const msg = await response.text();
        setUploadError(msg);
        return;
      }
      const data = await response.json() as { mensagem: string; jobId: string };
      setUploadResult(data);
    } catch (err: any) {
      setUploadError("Erro de rede: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* REMESSA */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6e00]" style={{ fontSize: "22px" }}>upload_file</span>
          Geração de Remessa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontSize: "32px" }}>account_balance</span>
            </div>
            <h3 className="text-xl font-bold">Sicoob</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Arquivo de remessa para boletos pendentes no Sicoob.</p>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-full">
              <span className="block text-xs font-bold text-slate-400 mb-1">BOLETOS PENDENTES</span>
              <span className="text-3xl font-black text-slate-700 dark:text-slate-200">
                {sicoobCount !== undefined ? sicoobCount : "-"}
              </span>
            </div>
            <button onClick={() => handleDownload("SICOOB")} disabled={loading === "SICOOB" || sicoobCount === 0}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading === "SICOOB" ? <span>Gerando...</span> : <><span className="material-symbols-outlined pb-0.5">download</span>Baixar Remessa</>}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-orange-600 dark:text-orange-400" style={{ fontSize: "32px" }}>account_balance</span>
            </div>
            <h3 className="text-xl font-bold">Itaú</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Arquivo de remessa para boletos pendentes no Itaú.</p>
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg w-full">
              <span className="block text-xs font-bold text-slate-400 mb-1">BOLETOS PENDENTES</span>
              <span className="text-3xl font-black text-slate-700 dark:text-slate-200">
                {itauCount !== undefined ? itauCount : "-"}
              </span>
            </div>
            <button onClick={() => handleDownload("ITAU")} disabled={loading === "ITAU" || itauCount === 0}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading === "ITAU" ? <span>Gerando...</span> : <><span className="material-symbols-outlined pb-0.5">download</span>Baixar Remessa</>}
            </button>
          </div>
        </div>
      </div>

      {/* RETORNO */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6e00]" style={{ fontSize: "22px" }}>download_done</span>
          Processamento de Retorno
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-6">
            Faça o upload do arquivo <strong>.ret</strong> recebido do banco para atualizar o status dos boletos automaticamente.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">BANCO DO RETORNO</label>
              <div className="flex gap-2">
                {(["SICOOB", "ITAU"] as const).map(b => (
                  <label key={b} className="cursor-pointer">
                    <input type="radio" value={b} checked={bancoSelecionado === b} onChange={() => setBancoSelecionado(b)} className="hidden peer" />
                    <div className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-[#ff6e00] peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/20 peer-checked:text-[#ff6e00] text-sm font-bold transition-all">
                      {b === "SICOOB" ? "Sicoob" : "Itaú"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold text-slate-500">ARQUIVO DE RETORNO (.RET)</label>
              <input ref={fileRef} type="file" accept=".ret,.RET,.txt,.TXT"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300"
              />
            </div>

            <button onClick={handleUploadRetorno} disabled={uploadLoading}
              className="px-6 py-2.5 rounded-xl bg-[#ff6e00] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0">
              {uploadLoading ? <span>Processando...</span> : <><span className="material-symbols-outlined pb-0.5">cloud_upload</span>Enviar Retorno</>}
            </button>
          </div>

          {uploadResult && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 shrink-0" style={{ fontSize: "20px" }}>check_circle</span>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{uploadResult.mensagem}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Job ID: {uploadResult.jobId} – Processamento em segundo plano.</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-rose-500 shrink-0" style={{ fontSize: "20px" }}>error</span>
              <p className="text-sm text-rose-700 dark:text-rose-400">{uploadError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
