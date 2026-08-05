import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { formatBRL, unitLabel } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/consumidor/carrinho")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Cart />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

function Cart() {
  const { items, remove, setQty, totalCents } = useCart();
  if (items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        description="Volte para o catálogo e escolha produtos frescos."
        icon={<ShoppingCart className="h-6 w-6" />}
        action={
          <Link to="/consumidor/home">
            <Button>Ver produtos</Button>
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        {items.map((i) => (
          <Card key={i.productId} className="flex items-center gap-4 p-4">
            <img
              src={i.product.photoUrls?.[0] ?? `https://picsum.photos/seed/${i.productId}/100/100`}
              alt={i.product.name}
              className="h-16 w-16 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-medium">{i.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBRL(i.product.priceCents)} / {unitLabel[i.product.unit]}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQty(i.productId, i.qty - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQty(i.productId, i.qty + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatBRL(i.product.priceCents * i.qty)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => remove(i.productId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Card className="sticky top-20 h-fit p-5">
        <h3 className="font-semibold">Resumo</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatBRL(totalCents)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span className="text-primary">{formatBRL(totalCents)}</span>
          </div>
        </div>
        <Link to="/consumidor/checkout">
          <Button size="lg" className="mt-4 w-full">
            Finalizar pedido
          </Button>
        </Link>
      </Card>
    </div>
  );
}
