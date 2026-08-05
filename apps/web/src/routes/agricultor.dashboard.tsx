import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDate } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import { Package, ClipboardList, AlertTriangle, DollarSign, Plus, UserCog } from "lucide-react";
import { normalizeOrders, normalizeProducts } from "@/lib/normalizers";

export const Route = createFileRoute("/agricultor/dashboard")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="FARMER">
      <LayoutFarmer>
        <Dashboard />
      </LayoutFarmer>
    </ProtectedRoute>
  );
}

function toItems<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
  return Array.isArray(data) ? data : (data?.items ?? []);
}

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get("/products/mine")
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/orders/inbox", { params: { status: "PENDING" } })
        .then((r) => r.data)
        .catch(() => []),
      api
        .get("/orders/inbox", { params: { status: "CONFIRMED" } })
        .then((r) => r.data)
        .catch(() => []),
    ])
      .then(([productsData, pendingData, confirmedData]) => {
        setProducts(normalizeProducts(toItems<Product>(productsData)));
        setPendingOrders(normalizeOrders(toItems<Order>(pendingData)));
        setConfirmedOrders(normalizeOrders(toItems<Order>(confirmedData)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const activeProducts = products.filter((product) => product.active !== false);
  const totalStock = activeProducts.reduce((sum, product) => sum + (product.stockQty ?? 0), 0);
  const lowStock = activeProducts.filter((product) => product.stockQty <= 5);

  const estimatedSales = [...pendingOrders, ...confirmedOrders].reduce(
    (sum, order) => sum + (order.totalCents ?? 0),
    0,
  );

  const stats = [
    { icon: Package, label: "Produtos ativos", value: activeProducts.length },
    { icon: ClipboardList, label: "Estoque total", value: totalStock },
    { icon: AlertTriangle, label: "Pedidos pendentes", value: pendingOrders.length },
    { icon: DollarSign, label: "Vendas previstas", value: formatBRL(estimatedSales) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua produção.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/agricultor/produtos/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo produto
          </Button>
        </Link>

        <Link to="/agricultor/pedidos">
          <Button variant="outline">
            <ClipboardList className="h-4 w-4" /> Ver pedidos
          </Button>
        </Link>

        <Link to="/agricultor/perfil">
          <Button variant="outline">
            <UserCog className="h-4 w-4" /> Editar perfil
          </Button>
        </Link>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" /> Alerta de estoque baixo
          </h3>

          <ul className="mt-2 text-sm text-amber-900">
            {lowStock.map((product) => (
              <li key={product.id}>
                {product.name} — {product.stockQty} restantes
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-semibold">Novos pedidos</h2>

        {pendingOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido pendente.</p>
        ) : (
          <div className="space-y-2">
            {pendingOrders.slice(0, 5).map((order) => (
              <Card key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.consumer?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items?.length ?? 0} item(ns)
                  </p>
                </div>

                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-1 font-bold text-primary">{formatBRL(order.totalCents ?? 0)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
