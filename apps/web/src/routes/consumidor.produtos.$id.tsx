import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingState } from "@/components/LoadingState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatBRL, unitLabel, categoryLabel, formatDate } from "@/lib/format";
import type { Product, Certification } from "@/lib/types";
import { Minus, Plus, ShoppingCart, MessageCircle, MapPin, Award } from "lucide-react";
import { normalizeProduct } from "@/lib/normalizers";

export const Route = createFileRoute("/consumidor/produtos/$id")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Detail />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

function Detail() {
  const { id } = useParams({ from: "/consumidor/produtos/$id" });
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get(`/catalog/products/${id}`)
      .then((r) => {
        const product = normalizeProduct(r.data);

        setP(product);
        setCerts(product.certs ?? []);
      })
      .catch(() => {
        setP(null);
        setCerts([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (!p) return <p className="text-muted-foreground">Produto não encontrado.</p>;

  const onAdd = () => {
    const r = add(p, qty);
    if (!r.ok) toast.error(r.reason!);
    else toast.success("Adicionado ao carrinho");
  };

  const whatsapp = p.farmer?.phone
    ? `https://wa.me/55${p.farmer.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vi seu produto " + p.name + " na GreenTech.")}`
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="overflow-hidden p-0">
        <div className="aspect-square bg-muted">
          <img
            src={p.photoUrls?.[0] ?? `https://picsum.photos/seed/${p.id}/800/800`}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        </div>
      </Card>
      <div className="space-y-4">
        <div>
          <Badge variant="secondary">{categoryLabel[p.category]}</Badge>
          <h1 className="mt-2 text-3xl font-bold">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{formatBRL(p.priceCents)}</p>
          <p className="text-sm text-muted-foreground">
            por {unitLabel[p.unit]} · {p.stockQty} em estoque
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-semibold">{qty}</span>
          <Button variant="outline" size="icon" onClick={() => setQty(qty + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={onAdd} size="lg" className="flex-1">
            <ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho
          </Button>
        </div>
        {certs.length > 0 && (
          <Card className="p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Award className="h-4 w-4 text-primary" /> Certificações
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              {certs.map((c) => (
                <li key={c.id} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Válido até {formatDate(c.validUntil ?? undefined)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {p.farmer && (
          <Card className="p-4">
            <h3 className="font-semibold">Sobre o agricultor</h3>
            <p className="mt-1 text-sm font-medium">{p.farmer.propertyName ?? p.farmer.name}</p>
            <p className="text-xs text-muted-foreground">{p.farmer.name}</p>
            {p.farmer.city && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {p.farmer.city}
              </p>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="mt-3 w-full">
                  <MessageCircle className="h-4 w-4" /> Falar pelo WhatsApp
                </Button>
              </a>
            )}
          </Card>
        )}
        <Link
          to="/consumidor/home"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
