import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { formatBRL, unitLabel, categoryLabel } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/agricultor/produtos/")({ component: Page });

function Page() { return <ProtectedRoute role="FARMER"><LayoutFarmer><List /></LayoutFarmer></ProtectedRoute>; }

function List() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const load = () => {
    setLoading(true);
    api.get("/products/mine").then((r) => setProducts(Array.isArray(r.data) ? r.data : (r.data.items ?? []))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => products.filter((p) => {
    if (filter === "ACTIVE" && p.active === false) return false;
    if (filter === "INACTIVE" && p.active !== false) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [products, q, filter]);

  const onDelete = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    try { await api.delete(`/products/${id}`); toast.success("Produto removido"); load(); }
    catch { toast.error("Falha ao remover"); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Meus produtos</h1>
        <Link to="/agricultor/produtos/novo"><Button><Plus className="h-4 w-4" /> Novo produto</Button></Link>
      </div>
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto..." className="pl-9" />
          </div>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "ALL" ? "Todos" : f === "ACTIVE" ? "Ativos" : "Inativos"}
            </Button>
          ))}
        </div>
      </Card>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="Sem produtos" description="Cadastre seu primeiro produto." action={<Link to="/agricultor/produtos/novo"><Button>Novo produto</Button></Link>} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="flex items-center gap-4 p-4">
              <img src={p.photoUrls?.[0] ?? `https://picsum.photos/seed/${p.id}/100/100`} alt={p.name} className="h-16 w-16 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{p.name}</p>
                  <Badge variant="secondary">{categoryLabel[p.category]}</Badge>
                  {p.active === false && <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{formatBRL(p.priceCents)} / {unitLabel[p.unit]} · {p.stockQty} em estoque</p>
              </div>
              <div className="flex gap-2">
                <Link to="/agricultor/produtos/$id/editar" params={{ id: p.id }}>
                  <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /> Editar</Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(p.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}