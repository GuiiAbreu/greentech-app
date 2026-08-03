import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductForm } from "@/components/ProductForm";
import { api } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/agricultor/produtos/novo")({ component: Page });

function Page() { return <ProtectedRoute role="FARMER"><LayoutFarmer><Body /></LayoutFarmer></ProtectedRoute>; }

function Body() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Novo produto</h1>
      <ProductForm onSubmit={async (payload, cert) => {
        try {
          const res = await api.post("/products", payload);
          const productId = res.data.id;
          if (cert && cert.title) {
            await api.post("/certifications", { ...cert, productId }).catch(() => null);
          }
          toast.success("Produto criado");
          navigate({ to: "/agricultor/produtos" });
        } catch { toast.error("Falha ao criar produto"); }
      }} />
    </div>
  );
}