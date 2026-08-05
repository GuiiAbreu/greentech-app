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
import {
  Package,
  ClipboardList,
  AlertTriangle,
  DollarSign,
  Plus,
  UserCog,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
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

function sumOrders(orders: Order[]) {
  return orders.reduce((sum, order) => sum + (order.totalCents ?? order.subtotalCents ?? 0), 0);
}

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [doneOrders, setDoneOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get("/products/mine")
        .then((response) => response.data)
        .catch(() => []),
      api
        .get("/orders/inbox", { params: { status: "PENDING" } })
        .then((response) => response.data)
        .catch(() => []),
      api
        .get("/orders/inbox", { params: { status: "CONFIRMED" } })
        .then((response) => response.data)
        .catch(() => []),
      api
        .get("/orders/inbox", { params: { status: "DONE" } })
        .then((response) => response.data)
        .catch(() => []),
    ])
      .then(([productsData, pendingData, confirmedData, doneData]) => {
        setProducts(normalizeProducts(toItems<Product>(productsData)));
        setPendingOrders(normalizeOrders(toItems<Order>(pendingData)));
        setConfirmedOrders(normalizeOrders(toItems<Order>(confirmedData)));
        setDoneOrders(normalizeOrders(toItems<Order>(doneData)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const activeProducts = products.filter((product) => product.active !== false);
  const totalStock = activeProducts.reduce((sum, product) => sum + (product.stockQty ?? 0), 0);
  const lowStock = activeProducts.filter((product) => product.stockQty <= 5);

  const pendingSales = sumOrders(pendingOrders);
  const confirmedSales = sumOrders(confirmedOrders);
  const estimatedSales = pendingSales + confirmedSales;
  const completedSales = sumOrders(doneOrders);

  const stats = [
    {
      icon: Package,
      label: "Produtos ativos",
      value: activeProducts.length,
      description: "Produtos visíveis no catálogo",
    },
    {
      icon: ClipboardList,
      label: "Estoque total",
      value: totalStock,
      description: "Soma dos produtos ativos",
    },
    {
      icon: AlertTriangle,
      label: "Pedidos pendentes",
      value: pendingOrders.length,
      description: "Aguardando confirmação",
    },
    {
      icon: TrendingUp,
      label: "Vendas previstas",
      value: formatBRL(estimatedSales),
      description: "Pendentes + confirmados",
    },
    {
      icon: CheckCircle2,
      label: "Vendas concluídas",
      value: formatBRL(completedSales),
      description: "Pedidos finalizados",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral dos seus produtos, pedidos e vendas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              </div>

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Resumo financeiro</h2>
            <p className="text-sm text-muted-foreground">
              Separação entre valores em andamento e valores já concluídos.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Pedidos pendentes</p>
            <p className="mt-1 text-xl font-bold">{formatBRL(pendingSales)}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Pedidos confirmados</p>
            <p className="mt-1 text-xl font-bold">{formatBRL(confirmedSales)}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Pedidos concluídos</p>
            <p className="mt-1 text-xl font-bold text-primary">{formatBRL(completedSales)}</p>
          </div>
        </div>
      </Card>

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
              <Card key={order.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{order.consumer?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items?.length ?? 0} item(ns)
                  </p>
                </div>

                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-1 font-bold text-primary">
                    {formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
