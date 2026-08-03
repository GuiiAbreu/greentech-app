import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/services/api";
import { toast } from "sonner";
import { formatBRL } from "@/lib/format";
import { Truck, Store, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryMethod } from "@/lib/types";

export const Route = createFileRoute("/consumidor/checkout")({ component: Page });

function Page() {
  return (
    <ProtectedRoute role="CONSUMER">
      <LayoutConsumer><Checkout /></LayoutConsumer>
    </ProtectedRoute>
  );
}

function Checkout() {
  const { items, totalCents, clear } = useCart();
  const [method, setMethod] = useState<DeliveryMethod>("PICKUP");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (done) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">Pedido realizado!</h1>
        <p className="mt-1 text-muted-foreground">O agricultor entrará em contato em breve.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/consumidor/pedidos" className="flex-1"><Button className="w-full">Meus pedidos</Button></Link>
          <Link to="/consumidor/home" className="flex-1"><Button variant="outline" className="w-full">Continuar comprando</Button></Link>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    navigate({ to: "/consumidor/carrinho" });
    return null;
  }

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/orders", {
        deliveryMethod: method,
        note,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      clear();
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Falha ao finalizar pedido");
    } finally { setLoading(false); }
  };

  const MethodBtn = ({ m, icon: Icon, label }: { m: DeliveryMethod; icon: typeof Truck; label: string }) => (
    <button type="button" onClick={() => setMethod(m)} className={cn(
      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
      method === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
    )}>
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
        </Card>
        <Card className="p-5">
          <Label>Observação (opcional)</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Algum recado para o agricultor?" className="mt-2" />
        </Card>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>O pagamento será combinado diretamente com o produtor.</AlertDescription>
        </Alert>
      </div>
      <Card className="h-fit p-5">
        <h3 className="font-semibold">Resumo</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">{i.product.name} × {i.qty}</span>
              <span>{formatBRL(i.product.priceCents * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 font-bold">
          <span>Total</span><span className="text-primary">{formatBRL(totalCents)}</span>
        </div>
        <Button size="lg" className="mt-4 w-full" onClick={submit} disabled={loading}>
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </Button>
      </Card>
    </div>
  );
}