import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductForm } from "@/components/ProductForm";
import { api } from "@/services/api";
import { toast } from "sonner";
import { LoadingState } from "@/components/LoadingState";
import type { Product, Certification } from "@/lib/types";

export const Route = createFileRoute("/agricultor/produtos/$id/editar")({ component: Page });

function Page() { return <ProtectedRoute role="FARMER"><LayoutFarmer><Body /></LayoutFarmer></ProtectedRoute>; }

function Body() {
  const { id } = useParams({ from: "/agricultor/produtos/$id/editar" });
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [cert, setCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/catalog/products/${id}`).then((r) => r.data).catch(() => null),
      api.get(`/certifications/product/${id}`).then((r) => (r.data?.[0] ?? null)).catch(() => null),
    ]).then(([p, c]) => { setProduct(p); setCert(c); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>
      <ProductForm initial={product} initialCert={cert} onSubmit={async (payload, certPayload) => {
        try {
          await api.put(`/products/${id}`, payload);
          if (certPayload && certPayload.title) {
            if (cert?.id) await api.put(`/certifications/${cert.id}`, certPayload);
            else await api.post("/certifications", { ...certPayload, productId: id });
          }
          toast.success("Produto atualizado");
          navigate({ to: "/agricultor/produtos" });
        } catch { toast.error("Falha ao atualizar"); }
      }} />
    </div>
  );
}