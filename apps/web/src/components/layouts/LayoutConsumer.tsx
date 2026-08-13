import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User as UserIcon, Package, LogOut, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function LayoutConsumer({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/consumidor/home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/consumidor/home" className="text-muted-foreground hover:text-foreground">
              Produtos
            </Link>
            <Link to="/consumidor/pedidos" className="text-muted-foreground hover:text-foreground">
              Pedidos
            </Link>
            <Link to="/educacao" className="text-muted-foreground hover:text-foreground">
              Educação
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/consumidor/carrinho">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Avatar className="h-5 w-5">
                    {user?.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-transparent">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.name?.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/consumidor/perfil" })}>
                  <UserIcon className="h-4 w-4" /> Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/consumidor/pedidos" })}>
                  <Package className="h-4 w-4" /> Meus pedidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/educacao" })}>
                  <BookOpen className="h-4 w-4" /> Educação
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
