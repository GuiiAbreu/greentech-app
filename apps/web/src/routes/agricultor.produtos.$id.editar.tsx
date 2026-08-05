import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductForm } from "@/components/ProductForm";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/services/api";
import { normalizeProduct } from "@/lib/normalizers";
import type { Certification, Product } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/agricultor/produtos/$id/editar")({
  component: EditProductPage,
});

function EditProductPage() {
  return (
    <ProtectedRoute role="FARMER">
      <LayoutFarmer>
        <EditProductContent />
      </LayoutFarmer>
    </ProtectedRoute>
  );
}

function EditProductContent() {
  const { id } = useParams({ from: "/agricultor/produtos/$id/editar" });
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);

        const [productsResponse, certificationResponse] = await Promise.all([
          api.get("/products/mine"),
          api.get(`/certifications/product/${id}`).catch(() => ({ data: [] })),
        ]);

        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : (productsResponse.data?.items ?? []);

        const foundProduct = productsData.find((item: Product) => item.id === id);

        setProduct(foundProduct ? normalizeProduct(foundProduct) : null);
        setCertification(certificationResponse.data?.[0] ?? null);
      } catch {
        toast.error("Falha ao carregar produto");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>
        <p>Produto não encontrado ou você não tem permissão para editá-lo.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>

      <ProductForm
        initial={product}
        initialCert={certification}
        onSubmit={async (payload, certPayload) => {
          try {
            await api.put(`/products/${id}`, payload);

            if (certPayload?.title) {
              if (certification?.id) {
                await api.put(`/certifications/${certification.id}`, certPayload);
              } else {
                await api.post("/certifications", {
                  ...certPayload,
                  productId: id,
                });
              }
            }

            toast.success("Produto atualizado");
            navigate({ to: "/agricultor/produtos" });
          } catch {
            toast.error("Falha ao atualizar produto");
          }
        }}
      />
    </div>
  );
}
