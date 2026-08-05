import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/services/api";
import { formatBRL, formatDate, deliveryLabel } from "@/lib/format";
import { normalizeOrder } from "@/lib/normalizers";
import type { Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  StickyNote,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/agricultor/pedidos/$id")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute role="FARMER">
      <LayoutFarmer>
        <OrderDetails />
      </LayoutFarmer>
    </ProtectedRoute>
  );
}

function onlyNumbers(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeBrazilPhone(phone?: string | null) {
  const numbers = onlyNumbers(phone);
  if (!numbers) return null;
  return numbers.startsWith("55") ? numbers : `55${numbers}`;
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

function OrderDetails() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get(`/orders/${id}`)
      .then((response) => setOrder(normalizeOrder(response.data)))
      .catch(() => {
        toast.error("Falha ao carregar pedido");
        setOrder(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const updateStatus = async (next: OrderStatus) => {
    if (!order) return;

    setUpdating(true);

    try {
      const response = await api.patch(`/orders/${order.id}/status`, { status: next });
      setOrder(normalizeOrder(response.data));

      if (next === "CANCELED") {
        setShowCancelModal(false);
      }

      toast.success(
        next === "CONFIRMED"
          ? "Pedido confirmado e estoque atualizado"
          : next === "DONE"
            ? "Pedido concluído"
            : next === "CANCELED"
              ? "Pedido cancelado"
              : "Pedido atualizado",
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao atualizar pedido");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/agricultor/pedidos">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <Card className="mt-4 p-6">
          <h1 className="text-xl font-bold">Pedido não encontrado</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O pedido não existe ou você não tem permissão para visualizá-lo.
          </p>
        </Card>
      </div>
    );
  }

  const whatsappUrl = buildConsumerWhatsAppUrl(order);
  const isDelivery = order.deliveryMethod === "DELIVERY";

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              Pedido #{shortOrderCode(order.id)}
            </p>
            <h1 className="text-2xl font-bold">Detalhes do pedido</h1>
          </div>

          <Link to="/agricultor/pedidos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{order.consumer?.name ?? "Cliente"}</h2>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(order.createdAt)}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  {deliveryLabel[order.deliveryMethod]}
                </span>

                {order.consumer?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {order.consumer.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                {formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}
              </p>
            </div>
          </div>
        </Card>

        {isDelivery && (
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Endereço de entrega
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.deliveryAddress || "Endereço não informado"}
            </p>
          </Card>
        )}

        {order.note && (
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold">
              <StickyNote className="h-4 w-4 text-primary" />
              Observação do consumidor
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{order.note}</p>
          </Card>
        )}

        <Card className="p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <Package className="h-4 w-4 text-primary" />
            Itens do pedido
          </p>

          <div className="space-y-2">
            {order.items?.map((item, index) => {
              const name = item.product?.name ?? item.productName ?? "Produto";
              const unitPrice =
                item.unitPriceCents ?? item.priceCents ?? item.product?.priceCents ?? 0;
              const lineTotal = item.lineTotalCents ?? unitPrice * item.qty;

              return (
                <div
                  key={item.id ?? `${item.productId}-${index}`}
                  className="flex justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-muted-foreground">
                      {item.qty} × {formatBRL(unitPrice)}
                    </p>
                  </div>

                  <p className="font-semibold">{formatBRL(lineTotal)}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-wrap gap-2 p-5">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Button variant="outline">
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </Button>
            </a>
          )}

          {order.status === "PENDING" && (
            <Button onClick={() => updateStatus("CONFIRMED")} disabled={updating}>
              Confirmar pedido
            </Button>
          )}

          {order.status === "CONFIRMED" && (
            <Button onClick={() => updateStatus("DONE")} disabled={updating}>
              Concluir pedido
            </Button>
          )}

          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setShowCancelModal(true)}
              disabled={updating}
            >
              Cancelar pedido
            </Button>
          )}

          {order.status === "DONE" && <Badge variant="outline">Pedido concluído</Badge>}

          {order.status === "CANCELED" && (
            <Badge variant="outline" className="text-muted-foreground">
              Pedido cancelado
            </Badge>
          )}
        </Card>
      </div>

      {showCancelModal && (
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
                    #{shortOrderCode(order.id)}
                  </span>{" "}
                  será marcado como cancelado.
                </p>

                {order.status === "CONFIRMED" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Como este pedido já foi confirmado, o estoque dos produtos será restaurado.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                disabled={updating}
              >
                Manter pedido
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => updateStatus("CANCELED")}
                disabled={updating}
              >
                {updating ? "Cancelando..." : "Cancelar pedido"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
