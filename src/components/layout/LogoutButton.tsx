"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-sm"
      title="Sair"
    >
      <LogOut className="size-5" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
