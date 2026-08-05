import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDate, deliveryLabel } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";
import { normalizeOrders } from "@/lib/normalizers";

export const Route = createFileRoute("/agricultor/pedidos")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="FARMER">
      <LayoutFarmer>
        <Inbox />
      </LayoutFarmer>
    </ProtectedRoute>
  );
}

function Inbox() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pedidos recebidos</h1>
      <Tabs defaultValue="PENDING">
        <TabsList>
          <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmados</TabsTrigger>
          <TabsTrigger value="DONE">Concluídos</TabsTrigger>
        </TabsList>
        {(["PENDING", "CONFIRMED", "DONE"] as OrderStatus[]).map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            <OrderTab status={s} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function OrderTab({ status }: { status: OrderStatus }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/orders/inbox", { params: { status } })
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.items ?? []);
        setOrders(normalizeOrders(data));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const updateStatus = async (id: string, next: OrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: next });
      toast.success("Pedido atualizado");
      load();
    } catch {
      toast.error("Falha ao atualizar");
    }
  };

  if (loading) return <LoadingState />;
  if (orders.length === 0) return <EmptyState title="Sem pedidos nesta aba" />;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
              <p className="mt-1 font-semibold">{o.consumer?.name ?? "Cliente"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(o.createdAt)} · {deliveryLabel[o.deliveryMethod]}
              </p>
              <ul className="mt-2 text-sm">
                {o.items?.map((i, idx) => (
                  <li key={i.id ?? idx} className="text-muted-foreground">
                    • {i.product?.name ?? i.productName ?? "Produto"} × {i.qty}
                  </li>
                ))}
              </ul>
              {o.note && <p className="mt-2 rounded-md bg-muted p-2 text-xs">{o.note}</p>}
            </div>
            <div className="text-right">
              <StatusBadge status={o.status} />
              <p className="mt-2 font-bold text-primary">{formatBRL(o.totalCents ?? 0)}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {o.status === "PENDING" && (
              <Button size="sm" onClick={() => updateStatus(o.id, "CONFIRMED")}>
                Confirmar
              </Button>
            )}
            {o.status === "CONFIRMED" && (
              <Button size="sm" onClick={() => updateStatus(o.id, "DONE")}>
                Concluir
              </Button>
            )}
            {(o.status === "PENDING" || o.status === "CONFIRMED") && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => updateStatus(o.id, "CANCELED")}
              >
                Cancelar
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
