"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2 } from "lucide-react";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/configuracoes/usuarios", label: "Usuários do Escritório", Icon: Users },
    { href: "/configuracoes/bancos", label: "Dados Bancários", Icon: Building2 },
  ];

  return (
    <div className="flex h-full flex-col md:flex-row bg-gray-50/50">
      <aside className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200">
        <div className="p-4 md:p-6 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">Configurações</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie os acessos e os dados do seu escritório.</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-[#ff6e00]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#ff6e00]" : "text-gray-400"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <main className="flex-1 overflow-auto bg-white min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
