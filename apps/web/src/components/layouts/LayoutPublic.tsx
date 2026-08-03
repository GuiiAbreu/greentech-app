import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export function LayoutPublic({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Início</Link>
            <a href="#produtos" className="text-muted-foreground hover:text-foreground">Produtos</a>
            <a href="#sobre" className="text-muted-foreground hover:text-foreground">Sobre</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Entrar</Button></Link>
            <Link to="/cadastro"><Button>Cadastrar</Button></Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} GreenTech · Conectando o campo à sua mesa.
      </footer>
    </div>
  );
}