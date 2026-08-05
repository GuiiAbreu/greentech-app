import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatDate, deliveryLabel } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";
import { normalizeOrders } from "@/lib/normalizers";
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  StickyNote,
  Truck,
} from "lucide-react";

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

const tabs: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pendentes" },
  { status: "CONFIRMED", label: "Confirmados" },
  { status: "DONE", label: "Concluídos" },
  { status: "CANCELED", label: "Cancelados" },
];

function Inbox() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Pedidos recebidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe os pedidos dos consumidores e combine entrega, retirada e pagamento.
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
            <OrderTab status={tab.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

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

function buildConsumerWhatsAppUrl(order: Order) {
  const phone = normalizeBrazilPhone(order.consumer?.phone);

  if (!phone) return null;

  const itemsText = order.items
    ?.map((item) => {
      const name = item.product?.name ?? item.productName ?? "Produto";
      return `- ${name} x ${item.qty}`;
    })
    .join("\n");

  const methodText = order.deliveryMethod === "DELIVERY" ? "Receber em casa" : "Retirar no local";

  const message = [
    `Olá, ${order.consumer?.name ?? "cliente"}! Recebi seu pedido #${shortOrderCode(
      order.id,
    )} pela GreenTech.`,
    "",
    "Produto(s):",
    itemsText,
    "",
    `Total: ${formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}`,
    `Forma de recebimento: ${methodText}`,
    order.deliveryAddress ? `Endereço de entrega: ${order.deliveryAddress}` : null,
    order.note ? `Observação: ${order.note}` : null,
    "",
    "Podemos combinar os detalhes da entrega/retirada e do pagamento por aqui.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    message,
  )}&type=phone_number&app_absent=0`;
}

function OrderTab({ status }: { status: OrderStatus }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);

    api
      .get("/orders/inbox", { params: { status } })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
        setOrders(normalizeOrders(data));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const updateStatus = async (id: string, next: OrderStatus) => {
    const actionLabel =
      next === "CONFIRMED"
        ? "confirmar"
        : next === "DONE"
          ? "concluir"
          : next === "CANCELED"
            ? "cancelar"
            : "atualizar";

    if (next === "CANCELED" && !confirm("Cancelar este pedido?")) {
      return;
    }

    try {
      await api.patch(`/orders/${id}/status`, { status: next });

      toast.success(
        next === "CONFIRMED"
          ? "Pedido confirmado e estoque atualizado"
          : next === "DONE"
            ? "Pedido concluído"
            : next === "CANCELED"
              ? "Pedido cancelado"
              : "Pedido atualizado",
      );

      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

      toast.error(msg ?? `Falha ao ${actionLabel} pedido`);
    }
  };

  if (loading) return <LoadingState />;
  if (orders.length === 0) return <EmptyState title="Sem pedidos nesta aba" />;

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const whatsappUrl = buildConsumerWhatsAppUrl(order);
        const isDelivery = order.deliveryMethod === "DELIVERY";

        return (
          <Card key={order.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    #{shortOrderCode(order.id)}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{order.consumer?.name ?? "Cliente"}</p>
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

                    {order.consumer?.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {order.consumer.phone}
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
                      Observação do consumidor
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

            <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                </a>
              )}

              {order.status === "PENDING" && (
                <Button size="sm" onClick={() => updateStatus(order.id, "CONFIRMED")}>
                  Confirmar pedido
                </Button>
              )}

              {order.status === "CONFIRMED" && (
                <Button size="sm" onClick={() => updateStatus(order.id, "DONE")}>
                  Concluir pedido
                </Button>
              )}

              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => updateStatus(order.id, "CANCELED")}
                >
                  Cancelar pedido
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
