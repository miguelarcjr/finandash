"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ArrowDownLeft, ArrowUpRight, BarChart3, Settings, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", Icon: Home },
    { href: "/clientes", label: "Clientes", Icon: Users },
    { href: "/receber", label: "Receber", Icon: ArrowDownLeft },
    { href: "/contas-a-pagar", label: "Pagar", Icon: ArrowUpRight },
    { href: "/conciliacao", label: "Conciliação", Icon: LayoutDashboard },
    { href: "/relatorios/liquidacoes", label: "Relatórios", Icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-bold leading-none truncate">FinanDash</h1>
            <p className="text-xs text-slate-500 truncate mt-1">Gestão Financeira</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {navLinks.map(({ href, label, Icon }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link
            href="/configuracoes"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname?.startsWith("/configuracoes")
                ? "text-primary bg-primary/10"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="size-5 shrink-0" />
            <span className="text-sm">Configurações</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Placeholder */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 pb-safe">
        {navLinks.slice(0, 4).map(({ href, label, Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                isActive ? "text-primary" : "text-slate-500"
              }`}
            >
              <Icon className="size-6 mb-1" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/configuracoes"
          className={`flex flex-col items-center justify-center p-2 rounded-lg ${
            pathname?.startsWith("/configuracoes") ? "text-primary" : "text-slate-500"
          }`}
        >
          <Settings className="size-6 mb-1" />
          <span className="text-[10px] font-medium leading-none">Mais</span>
        </Link>
      </div>
    </>
  );
}
