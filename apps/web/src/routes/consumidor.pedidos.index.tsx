import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { formatBRL, formatDate, deliveryLabel } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { normalizeOrders } from "@/lib/normalizers";
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  StickyNote,
  Truck,
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/consumidor/pedidos/")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Orders />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

const tabs: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pendentes" },
  { status: "CONFIRMED", label: "Confirmados" },
  { status: "DONE", label: "Concluídos" },
  { status: "CANCELED", label: "Cancelados" },
];

function onlyNumbers(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeBrazilPhone(phone?: string | null) {
  const numbers = onlyNumbers(phone);

  if (!numbers) return null;

  if (numbers.startsWith("55")) {
    return numbers;
  }

  return `55${numbers}`;
}

function shortOrderCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function buildFarmerWhatsAppUrl(order: Order) {
  const phone = normalizeBrazilPhone(order.farmer?.phone);

  if (!phone) return null;

  const farmerName = order.farmer?.propertyName ?? order.farmer?.name ?? "agricultor";

  const itemsText = order.items
    ?.map((item) => {
      const name = item.product?.name ?? item.productName ?? "Produto";
      return `- ${name} x ${item.qty}`;
    })
    .join("\n");

  const methodText = order.deliveryMethod === "DELIVERY" ? "Receber em casa" : "Retirar no local";

  const message = [
    `Olá! Tenho uma dúvida sobre meu pedido #${shortOrderCode(order.id)} pela GreenTech.`,
    "",
    `Agricultor: ${farmerName}`,
    "",
    "Produto(s):",
    itemsText,
    "",
    `Total: ${formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}`,
    `Forma de recebimento: ${methodText}`,
    order.deliveryAddress ? `Endereço de entrega: ${order.deliveryAddress}` : null,
    order.note ? `Observação: ${order.note}` : null,
    "",
    "Gostaria de combinar os detalhes da entrega/retirada e do pagamento.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    message,
  )}&type=phone_number&app_absent=0`;
}

function useOrders(status: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);

    api
      .get("/orders/mine", { params: { status } })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        setOrders(normalizeOrders(data));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [status, reloadKey]);

  return {
    orders,
    loading,
    reload: () => setReloadKey((current) => current + 1),
  };
}

function OrderList({ status }: { status: OrderStatus }) {
  const { orders, loading, reload } = useOrders(status);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [canceling, setCanceling] = useState(false);

  const cancelOrder = async () => {
    if (!orderToCancel) return;

    setCanceling(true);

    try {
      await api.patch(`/orders/${orderToCancel.id}/cancel`);
      toast.success("Pedido cancelado");
      setOrderToCancel(null);
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao cancelar pedido");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <LoadingState />;
  if (orders.length === 0) return <EmptyState title="Nenhum pedido nesta aba" />;

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => {
          const whatsappUrl = buildFarmerWhatsAppUrl(order);
          const isDelivery = order.deliveryMethod === "DELIVERY";
          const farmerName = order.farmer?.propertyName ?? order.farmer?.name ?? "Agricultor";

          return (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{shortOrderCode(order.id)}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{farmerName}</p>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(order.createdAt)}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {deliveryLabel[order.deliveryMethod]}
                      </span>

                      {order.farmer?.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {order.farmer.phone}
                        </span>
                      )}

                      {order.farmer?.name && order.farmer?.propertyName && (
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5" />
                          {order.farmer.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {isDelivery && (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        Endereço de entrega
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {order.deliveryAddress || "Endereço não informado"}
                      </p>
                    </div>
                  )}

                  {order.note && (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        <StickyNote className="h-4 w-4 text-primary" />
                        Observação enviada
                      </p>
                      <p className="mt-1 text-muted-foreground">{order.note}</p>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Package className="h-4 w-4 text-primary" />
                      Itens do pedido
                    </p>

                    <ul className="space-y-1 text-sm">
                      {order.items?.map((item, index) => {
                        const name = item.product?.name ?? item.productName ?? "Produto";
                        const unitPrice =
                          item.unitPriceCents ?? item.priceCents ?? item.product?.priceCents ?? 0;
                        const lineTotal = item.lineTotalCents ?? unitPrice * item.qty;

                        return (
                          <li
                            key={item.id ?? `${item.productId}-${index}`}
                            className="flex justify-between gap-3 text-muted-foreground"
                          >
                            <span>
                              • {name} × {item.qty}
                            </span>
                            <span>{formatBRL(lineTotal)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="min-w-36 text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">
                    {formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}
                  </p>

                  {order.status === "PENDING" && (
                    <Badge variant="outline" className="mt-2">
                      Aguardando confirmação
                    </Badge>
                  )}

                  {order.status === "CONFIRMED" && (
                    <Badge variant="outline" className="mt-2">
                      Confirmado pelo agricultor
                    </Badge>
                  )}

                  {order.status === "DONE" && (
                    <Badge variant="outline" className="mt-2">
                      Pedido concluído
                    </Badge>
                  )}

                  {order.status === "CANCELED" && (
                    <Badge variant="outline" className="mt-2 text-muted-foreground">
                      Pedido cancelado
                    </Badge>
                  )}
                </div>
              </div>

              {(whatsappUrl || order.status === "PENDING") && (
                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  <Link to="/consumidor/pedidos/$id" params={{ id: order.id }}>
                    <Button size="sm" variant="outline">
                      Ver detalhes
                    </Button>
                  </Link>

                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                        Falar pelo WhatsApp
                      </Button>
                    </a>
                  )}

                  {order.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => setOrderToCancel(order)}
                    >
                      Cancelar pedido
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border bg-card p-6 shadow-xl">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Cancelar pedido?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  O pedido{" "}
                  <span className="font-mono font-medium text-foreground">
                    #{shortOrderCode(orderToCancel.id)}
                  </span>{" "}
                  será cancelado e não poderá mais ser confirmado pelo agricultor.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOrderToCancel(null)}
                disabled={canceling}
              >
                Manter pedido
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={cancelOrder}
                disabled={canceling}
              >
                {canceling ? "Cancelando..." : "Cancelar pedido"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function Orders() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Meus pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe seus pedidos e combine entrega, retirada e pagamento com o agricultor.
        </p>
      </div>

      <Tabs defaultValue="PENDING">
        <TabsList className="flex flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.status} value={tab.status}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.status} value={tab.status} className="mt-4">
            <OrderList status={tab.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
