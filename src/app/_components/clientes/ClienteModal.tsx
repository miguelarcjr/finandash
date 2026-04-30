"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { X } from "lucide-react";

const clienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  cpfCnpj: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteAEditar?: any;
  onSuccess: () => void;
}

export function ClienteModal({ isOpen, onClose, clienteAEditar, onSuccess }: ClienteModalProps) {
  const utils = api.useUtils();
  const createMutation = api.cliente.create.useMutation({
    onSuccess: () => {
      onSuccess();
      void utils.cliente.list.invalidate();
      onClose();
    },
  });

  const updateMutation = api.cliente.update.useMutation({
    onSuccess: () => {
      onSuccess();
      void utils.cliente.list.invalidate();
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      cpfCnpj: "",
      email: "",
      telefone: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (clienteAEditar) {
        reset({
          id: clienteAEditar.id,
          nome: clienteAEditar.nome,
          cpfCnpj: clienteAEditar.cpfCnpj || "",
          email: clienteAEditar.email || "",
          telefone: clienteAEditar.telefone || "",
        });
      } else {
        reset({
          nome: "",
          cpfCnpj: "",
          email: "",
          telefone: "",
        });
      }
    }
  }, [isOpen, clienteAEditar, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: ClienteFormValues) => {
    if (data.id) {
      updateMutation.mutate({
        id: data.id,
        data: {
          nome: data.nome,
          cpfCnpj: data.cpfCnpj,
          email: data.email,
          telefone: data.telefone,
        },
      });
    } else {
      createMutation.mutate({
        nome: data.nome,
        cpfCnpj: data.cpfCnpj,
        email: data.email,
        telefone: data.telefone,
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-primary text-white">
          <h3 className="text-lg font-bold">
            {clienteAEditar ? "Editar Cliente" : "Novo Cliente"}
          </h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo / Razão Social <span className="text-rose-500">*</span></label>
            <input
              {...register("nome")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary text-sm p-3"
              placeholder="Ex: Empresa de Serviços LTDA"
              type="text"
            />
            {errors.nome && <p className="text-xs text-rose-500 mt-1">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">CPF / CNPJ</label>
              <input
                {...register("cpfCnpj")}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary text-sm p-3"
                placeholder="00.000.000/0001-00"
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Telefone/WhatsApp</label>
              <input
                {...register("telefone")}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary text-sm p-3"
                placeholder="(11) 99999-9999"
                type="text"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">E-mail Financeiro</label>
            <input
              {...register("email")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary text-sm p-3"
              placeholder="financeiro@empresa.com"
              type="email"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
              type="button"
            >
              Cancelar
            </button>
            <button
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50"
              type="submit"
            >
              {isSaving ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
