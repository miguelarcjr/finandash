import { Menu } from "lucide-react";
import { auth } from "~/server/auth";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const session = await auth();
  const userName = session?.user?.name ?? "Usuário";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-8 py-4">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Menu">
          <Menu className="size-6" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
            Acesso FinanDash
          </h2>
          <p className="text-sm text-slate-500 hidden sm:block">
            Gestão Financeira
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden lg:block">
            <p className="text-sm font-semibold truncate text-slate-800">{userName}</p>
            <p className="text-[10px] text-slate-500">Membro</p>
          </div>
          <div className="size-9 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
            <img 
              src={`https://placehold.co/100x100/ff6e00/white?text=${userInitials}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <LogoutButton />
      </div>
    </header>
  );
}
