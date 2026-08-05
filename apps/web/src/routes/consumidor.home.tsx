import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductCard } from "@/components/ProductCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { categoryLabel, formatBRL } from "@/lib/format";
import type { Product, ProductCategory } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { normalizeProducts } from "@/lib/normalizers";

export const Route = createFileRoute("/consumidor/home")({ component: Page });

const categories: (ProductCategory | "ALL")[] = [
  "ALL",
  "FRUTAS",
  "HORTALICAS",
  "LATICINIOS",
  "OVOS",
  "GRAOS",
];

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Home />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

function Home() {
  const { user } = useAuth();
  const { add, items, totalCents } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("ALL");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (city) params.city = city;
    if (cat !== "ALL") params.category = cat;
    api
      .get("/catalog/products", { params })
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : (r.data.items ?? []);
        setProducts(normalizeProducts(data));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, city, cat]);

  const onAdd = (p: Product) => {
    const r = add(p);
    if (!r.ok) toast.error(r.reason!);
    else toast.success(`${p.name} adicionado ao carrinho`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(" ")[0] ?? "Consumidor"}!</h1>
          <p className="text-sm text-muted-foreground">Encontre produtos frescos perto de você.</p>
        </div>
        <Card className="mb-4 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar produtos..."
                className="pl-9"
              />
            </div>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filtrar por cidade"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                variant={cat === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCat(c)}
              >
                {c === "ALL" ? "Todos" : categoryLabel[c]}
              </Button>
            ))}
          </div>
        </Card>
        {loading ? (
          <LoadingState />
        ) : products.length === 0 ? (
          <EmptyState title="Nenhum produto encontrado" description="Tente ajustar os filtros." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>
      <aside className="hidden lg:block">
        <Card className="sticky top-20 p-4">
          <h3 className="font-semibold">Seu carrinho</h3>
          <p className="text-xs text-muted-foreground">{items.length} item(ns)</p>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Adicione produtos para começar.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2 text-sm">
                {items.slice(0, 4).map((i) => (
                  <li key={i.productId} className="flex justify-between gap-2">
                    <span className="line-clamp-1">
                      {i.product.name} × {i.qty}
                    </span>
                    <span className="font-medium">{formatBRL(i.product.priceCents * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatBRL(totalCents)}</span>
              </div>
              <Link to="/consumidor/carrinho">
                <Button className="mt-3 w-full">Ver carrinho</Button>
              </Link>
            </>
          )}
        </Card>
      </aside>
    </div>
  );
}
