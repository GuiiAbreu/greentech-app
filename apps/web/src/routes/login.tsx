import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LayoutPublic } from "@/components/layouts/LayoutPublic";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Preencha e-mail e senha");
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success("Bem-vindo(a)!");
      navigate({ to: u.role === "FARMER" ? "/agricultor/dashboard" : "/consumidor/home" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutPublic>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <Logo className="mb-6" />
        <Card className="w-full p-6">
          <h1 className="text-center text-2xl font-bold">Que bom te ver de novo!</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Entre na sua conta GreenTech</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="font-semibold text-primary hover:underline">Criar conta</Link>
          </p>
        </Card>
      </div>
    </LayoutPublic>
  );
}