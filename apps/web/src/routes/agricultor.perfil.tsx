import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AvatarUploadField } from "@/components/AvatarUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { uploadAvatarImage } from "@/lib/uploads";
import { toast } from "sonner";

export const Route = createFileRoute("/agricultor/perfil")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="FARMER">
      <LayoutFarmer>
        <Profile />
      </LayoutFarmer>
    </ProtectedRoute>
  );
}

function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    propertyName: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user)
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
        propertyName: user.propertyName ?? "",
        address: user.address ?? "",
      });
  }, [user]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put("/me", form);
      let avatarFailed = false;

      if (avatarFile) {
        await uploadAvatarImage(avatarFile)
          .then(() => setAvatarFile(null))
          .catch(() => {
            avatarFailed = true;
          });
      }

      await refresh();
      if (avatarFailed) {
        toast.error("Perfil atualizado, mas falha ao enviar avatar");
      } else {
        toast.success("Perfil atualizado");
      }
    } catch {
      toast.error("Falha ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Meu perfil</h1>
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <AvatarUploadField
            currentUrl={user?.avatarUrl}
            name={form.name || user?.name}
            file={avatarFile}
            onFileChange={setAvatarFile}
          />
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome da propriedade</Label>
            <Input
              value={form.propertyName}
              onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Endereço para retirada</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={save} disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Link to="/alterar-senha">
            <Button variant="outline">Alterar senha</Button>
          </Link>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
}
