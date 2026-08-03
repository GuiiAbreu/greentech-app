import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LayoutPublic } from "@/components/layouts/LayoutPublic";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sprout, Tractor, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/cadastro")({ component: CadastroPage });

function CadastroPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("CONSUMER");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", password: "", confirm: "",
    propertyName: "", address: "",
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Preencha os campos obrigatórios");
    if (form.password !== form.confirm) return toast.error("As senhas não conferem");
    if (!terms) return toast.error("Aceite os termos para continuar");
    if (role === "FARMER" && (!form.propertyName || !form.address))
      return toast.error("Preencha os dados da propriedade");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        role, name: form.name, email: form.email, password: form.password,
        city: form.city, phone: form.phone,
      };
      if (role === "FARMER") {
        body.propertyName = form.propertyName;
        body.address = form.address;
      }
      const u = await register(body);
      toast.success("Cadastro realizado!");
      navigate({ to: (u?.role ?? role) === "FARMER" ? "/agricultor/dashboard" : "/consumidor/home" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha no cadastro");
    } finally { setLoading(false); }
  };

  const RoleCard = ({ r, icon: Icon, label, desc }: { r: Role; icon: typeof Sprout; label: string; desc: string }) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors",
        role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
      )}
    >
      <Icon className="h-8 w-8 text-primary" />
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );

  return (
    <LayoutPublic>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Escolha seu perfil e preencha os dados</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <RoleCard r="CONSUMER" icon={ShoppingBasket} label="Sou consumidor" desc="Quero comprar produtos" />
            <RoleCard r="FARMER" icon={Tractor} label="Sou agricultor" desc="Quero vender produtos" />
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome completo</Label>
                <Input value={form.name} onChange={set("name")} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={set("email")} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={set("phone")} placeholder="83988887777" />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={form.city} onChange={set("city")} placeholder="Sousa" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={form.password} onChange={set("password")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Confirmar senha</Label>
                <Input type="password" value={form.confirm} onChange={set("confirm")} />
              </div>
              {role === "FARMER" && (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Nome da propriedade</Label>
                    <Input value={form.propertyName} onChange={set("propertyName")} placeholder="Sítio Santo Antônio" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Endereço para retirada</Label>
                    <Input value={form.address} onChange={set("address")} placeholder="Zona Rural, Sousa" />
                  </div>
                </>
              )}
            </div>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={terms} onCheckedChange={(v) => setTerms(!!v)} />
              <span className="text-muted-foreground">Li e aceito os termos de uso da GreenTech.</span>
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link>
            </p>
          </form>
        </Card>
      </div>
    </LayoutPublic>
  );
}