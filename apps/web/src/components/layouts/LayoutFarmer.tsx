import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BookOpen,
  User as UserIcon,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menu = [
  { to: "/agricultor/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/agricultor/produtos", label: "Produtos", icon: Package },
  { to: "/agricultor/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/educacao", label: "Educação", icon: BookOpen },
  { to: "/agricultor/perfil", label: "Perfil", icon: UserIcon },
] as const;

export function LayoutFarmer({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const Nav = (
    <nav className="space-y-1 p-3">
      {menu.map(({ to, label, icon: Icon }) => {
        const active = location.pathname.startsWith(to);
        const showAvatar = label === "Perfil" && user?.avatarUrl;
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            {showAvatar ? (
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.avatarUrl!} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-transparent">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Icon className="h-4 w-4" />
            )}
            {label}
          </Link>
        );
      })}
      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border p-4">
          <Logo className="text-sidebar-foreground" />
        </div>
        {Nav}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>
        {open && <div className="border-b bg-sidebar text-sidebar-foreground md:hidden">{Nav}</div>}
        <main className="flex-1 overflow-x-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
