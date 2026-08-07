import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { LayoutPublic } from "@/components/layouts/LayoutPublic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/alterar-senha")({ component: Page });

function Page() {
  const { user } = useAuth();
  const Wrap = !user ? LayoutPublic : user.role === "FARMER" ? LayoutFarmer : LayoutConsumer;
  return (
    <ProtectedRoute>
      <Wrap>
        <Form />
      </Wrap>
    </ProtectedRoute>
  );
}

function Form() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error("Preencha as senhas");
    if (newPassword !== confirm) return toast.error("As senhas não conferem");
    setLoading(true);
    try {
      await api.put("/me/password", { currentPassword, newPassword });
      toast.success("Senha alterada com sucesso");
      navigate({ to: user?.role === "FARMER" ? "/agricultor/perfil" : "/consumidor/perfil" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao alterar senha");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-xl font-bold">Alterar senha</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="space-y-2"><Label>Senha atual</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} /></div>
          <div className="space-y-2"><Label>Nova senha</Label><Input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} /></div>
          <div className="space-y-2"><Label>Confirmar nova senha</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
        </form>
      </Card>
    </div>
  );
}