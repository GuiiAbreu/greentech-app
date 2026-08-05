/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/services/api";
import { formatBRL, formatDate, deliveryLabel } from "@/lib/format";
import { normalizeOrder } from "@/lib/normalizers";
import type { Order } from "@/lib/types";
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
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/consumidor/pedidos/$id")({
  component: Page,
});

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <OrderDetails />
      </LayoutConsumer>
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

function OrderDetails() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
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

  const cancelOrder = async () => {
    if (!order) return;

    setCanceling(true);

    try {
      const response = await api.patch(`/orders/${order.id}/cancel`);
      setOrder(normalizeOrder(response.data));
      setShowCancelModal(false);
      toast.success("Pedido cancelado");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao cancelar pedido");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/consumidor/pedidos">
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

  const whatsappUrl = buildFarmerWhatsAppUrl(order);
  const farmerName = order.farmer?.propertyName ?? order.farmer?.name ?? "Agricultor";
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

          <Link to="/consumidor/pedidos">
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
                <h2 className="text-lg font-semibold">{farmerName}</h2>
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

                {order.farmer?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {order.farmer.phone}
                  </span>
                )}

                {order.farmer?.name && order.farmer?.propertyName && (
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-4 w-4" />
                    {order.farmer.name}
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
              Observação enviada
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
              <Button>
                <MessageCircle className="h-4 w-4" />
                Falar pelo WhatsApp
              </Button>
            </a>
          )}

          {order.status === "PENDING" && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setShowCancelModal(true)}
              disabled={canceling}
            >
              Cancelar pedido
            </Button>
          )}

          {order.status === "CONFIRMED" && (
            <Badge variant="outline">Pedido confirmado pelo agricultor</Badge>
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
                  será cancelado e não poderá mais ser confirmado pelo agricultor.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelModal(false)}
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
