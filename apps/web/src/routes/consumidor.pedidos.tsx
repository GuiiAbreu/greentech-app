import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDate } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { normalizeOrders } from "@/lib/normalizers";

export const Route = createFileRoute("/consumidor/pedidos")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Orders />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

function useOrders(statuses: OrderStatus[]) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    Promise.all(
      statuses.map((s) => api.get("/orders/mine", { params: { status: s } }).then((r) => r.data)),
    )
      .then((arr) => {
        const data = arr.flatMap((x) => (Array.isArray(x) ? x : (x?.items ?? [])));
        setOrders(normalizeOrders(data));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [statuses]);
  return { orders, loading };
}

function OrderList({ statuses }: { statuses: OrderStatus[] }) {
  const { orders, loading } = useOrders(statuses);
  if (loading) return <LoadingState />;
  if (orders.length === 0) return <EmptyState title="Nenhum pedido aqui" />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
              <p className="mt-1 font-semibold">
                {o.farmer?.propertyName ?? o.farmer?.name ?? "Agricultor"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(o.createdAt)} · {o.items?.length ?? 0} item(ns)
              </p>
            </div>
            <div className="text-right">
              <StatusBadge status={o.status} />
              <p className="mt-2 font-bold text-primary">{formatBRL(o.totalCents ?? 0)}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Orders() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Meus pedidos</h1>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Em andamento</TabsTrigger>
          <TabsTrigger value="done">Concluídos</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <OrderList statuses={["PENDING", "CONFIRMED"]} />
        </TabsContent>
        <TabsContent value="done" className="mt-4">
          <OrderList statuses={["DONE", "CANCELED"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
