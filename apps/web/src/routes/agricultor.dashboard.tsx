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

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    ])
      .then(([p, o]) => {
        const productsData = Array.isArray(p) ? p : (p?.items ?? []);
        const ordersData = Array.isArray(o) ? o : (o?.items ?? []);

        setProducts(normalizeProducts(productsData));
        setOrders(normalizeOrders(ordersData));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  const active = products.filter((p) => p.active !== false);
  const stock = active.reduce((s, p) => s + (p.stockQty ?? 0), 0);
  const lowStock = active.filter((p) => p.stockQty <= 5);
  const estimate = orders.reduce((s, o) => s + (o.totalCents ?? 0), 0);

  const stats = [
    { icon: Package, label: "Produtos ativos", value: active.length },
    { icon: ClipboardList, label: "Estoque total", value: stock },
    { icon: AlertTriangle, label: "Pedidos pendentes", value: orders.length },
    { icon: DollarSign, label: "Estimativa de vendas", value: formatBRL(estimate) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua produção.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
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
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} — {p.stockQty} restantes
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div>
        <h2 className="mb-3 font-semibold">Novos pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido pendente.</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Card key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{o.consumer?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)} · {o.items?.length ?? 0} item(ns)
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} />
                  <p className="mt-1 font-bold text-primary">{formatBRL(o.totalCents ?? 0)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
