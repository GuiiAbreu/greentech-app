import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/services/api";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { Truck, Store, CheckCircle2, Info, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryMethod, Order } from "@/lib/types";

export const Route = createFileRoute("/consumidor/checkout")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer>
        <Checkout />
      </LayoutConsumer>
    </ProtectedRoute>
  );
}

function onlyNumbers(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function shortOrderCode(id?: string) {
  return id ? id.slice(0, 8).toUpperCase() : "NOVO";
}

function buildWhatsAppUrl(order: Order) {
  const phone = onlyNumbers(order.farmer?.phone);

  if (!phone) return null;

  const itemsText = order.items
    .map((item) => `- ${item.productName ?? item.product?.name ?? "Produto"} x ${item.qty}`)
    .join("\n");

  const methodText = order.deliveryMethod === "DELIVERY" ? "Receber em casa" : "Retirar no local";

  const message = [
    `Olá! Acabei de realizar o pedido #${shortOrderCode(order.id)} pela GreenTech.`,
    "",
    "Produto(s):",
    itemsText,
    "",
    `Total: ${formatBRL(order.totalCents ?? order.subtotalCents ?? 0)}`,
    `Forma de recebimento: ${methodText}`,
    order.deliveryAddress ? `Endereço: ${order.deliveryAddress}` : null,
    order.note ? `Observação: ${order.note}` : null,
    "",
    "Gostaria de combinar os detalhes da entrega/retirada e do pagamento.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://api.whatsapp.com/send/?phone=55${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

function Checkout() {
  const { items, totalCents, clear } = useCart();
  const [method, setMethod] = useState<DeliveryMethod>("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const whatsappUrl = createdOrder ? buildWhatsAppUrl(createdOrder) : null;

  if (createdOrder) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">Pedido realizado!</h1>
        <p className="mt-1 text-muted-foreground">
          O agricultor recebeu seu pedido. Você também pode falar diretamente pelo WhatsApp para
          combinar entrega, retirada ou pagamento.
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Código do pedido:{" "}
          <span className="font-semibold text-foreground">#{shortOrderCode(createdOrder.id)}</span>
        </p>

        <div className="mt-6 space-y-2">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Button className="w-full">
                <MessageCircle className="h-4 w-4" />
                Falar pelo WhatsApp
              </Button>
            </a>
          )}

          <div className="flex gap-2">
            <Link to="/consumidor/pedidos" className="flex-1">
              <Button variant="outline" className="w-full">
                Meus pedidos
              </Button>
            </Link>

            <Link to="/consumidor/home" className="flex-1">
              <Button variant="outline" className="w-full">
                Continuar comprando
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    navigate({ to: "/consumidor/carrinho" });
    return null;
  }

  const submit = async () => {
    const normalizedAddress = deliveryAddress.trim();

    if (method === "DELIVERY" && normalizedAddress.length < 5) {
      toast.error("Informe o endereço de entrega");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<Order>("/orders", {
        deliveryMethod: method,
        deliveryAddress: method === "DELIVERY" ? normalizedAddress : undefined,
        note: note.trim() || undefined,
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
      });

      clear();
      setCreatedOrder(response.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  };

  const MethodBtn = ({
    m,
    icon: Icon,
    label,
  }: {
    m: DeliveryMethod;
    icon: typeof Truck;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setMethod(m)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
        method === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
      )}
    >
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Finalizar pedido</h1>

        <Card className="p-5">
          <h3 className="mb-3 font-semibold">Como deseja receber?</h3>
          <div className="grid grid-cols-2 gap-3">
            <MethodBtn m="DELIVERY" icon={Truck} label="Receber em casa" />
            <MethodBtn m="PICKUP" icon={Store} label="Retirar no local" />
          </div>

          {method === "DELIVERY" && (
            <div className="mt-4 space-y-2">
              <Label>Endereço de entrega</Label>
              <Input
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Rua, número, bairro, cidade"
              />
              <p className="text-xs text-muted-foreground">
                Esse endereço será enviado ao agricultor junto com o pedido.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <Label>Observação (opcional)</Label>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Algum recado para o agricultor?"
            className="mt-2"
          />
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            O pagamento será combinado diretamente com o produtor.
          </AlertDescription>
        </Alert>
      </div>

      <Card className="h-fit p-5">
        <h3 className="font-semibold">Resumo</h3>

        <ul className="mt-3 space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                {item.product.name} × {item.qty}
              </span>
              <span>{formatBRL(item.product.priceCents * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span className="text-primary">{formatBRL(totalCents)}</span>
        </div>

        <Button size="lg" className="mt-4 w-full" onClick={submit} disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </Button>
      </Card>
    </div>
  );
}
