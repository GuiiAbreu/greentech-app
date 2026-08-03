import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categoryLabel, unitLabel, reaisToCents } from "@/lib/format";
import type { Product, Certification, ProductCategory, UnitType } from "@/lib/types";
import { Plus, X } from "lucide-react";

type Payload = {
  name: string; description?: string; category: ProductCategory;
  priceCents: number; unit: UnitType; stockQty: number;
  active?: boolean; photoUrls?: string[];
};

type CertPayload = { title: string; issuer: string; validUntil: string };

export function ProductForm({
  initial, initialCert, onSubmit,
}: {
  initial?: Product;
  initialCert?: Certification | null;
  onSubmit: (p: Payload, c?: CertPayload) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "HORTALICAS");
  const [price, setPrice] = useState(initial ? (initial.priceCents / 100).toFixed(2).replace(".", ",") : "");
  const [unit, setUnit] = useState<UnitType>(initial?.unit ?? "KG");
  const [stockQty, setStockQty] = useState(String(initial?.stockQty ?? 0));
  const [active, setActive] = useState(initial?.active !== false);
  const [photos, setPhotos] = useState<string[]>(initial?.photoUrls ?? [""]);
  const [certTitle, setCertTitle] = useState(initialCert?.title ?? "");
  const [certIssuer, setCertIssuer] = useState(initialCert?.issuer ?? "");
  const [certUntil, setCertUntil] = useState(initialCert?.validUntil?.slice(0, 10) ?? "");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanPhotos = photos.map((p) => p.trim()).filter(Boolean);
    const payload: Payload = {
      name, description, category,
      priceCents: reaisToCents(price),
      unit, stockQty: Number(stockQty) || 0,
      active, photoUrls: cleanPhotos.length ? cleanPhotos : undefined,
    };
    const certPayload = certTitle ? {
      title: certTitle, issuer: certIssuer,
      validUntil: certUntil ? new Date(certUntil).toISOString() : new Date().toISOString(),
    } : undefined;
    await onSubmit(payload, certPayload);
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(categoryLabel) as ProductCategory[]).map((c) => <SelectItem key={c} value={c}>{categoryLabel[c]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unidade</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as UnitType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(unitLabel) as UnitType[]).map((u) => <SelectItem key={u} value={u}>{unitLabel[u]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Preço (R$)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12,00" required /></div>
          <div className="space-y-2"><Label>Estoque</Label><Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} required /></div>
        </div>
        {initial && (
          <label className="flex items-center gap-3 text-sm"><Switch checked={active} onCheckedChange={setActive} /> Produto ativo</label>
        )}
        <div className="space-y-2">
          <Label>URLs das fotos (até 6)</Label>
          {photos.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input value={url} onChange={(e) => setPhotos((p) => p.map((x, idx) => idx === i ? e.target.value : x))} placeholder="https://..." />
              <Button type="button" variant="outline" size="icon" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          {photos.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setPhotos((p) => [...p, ""])}><Plus className="h-3 w-3" /> Adicionar foto</Button>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Certificação (opcional)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Título</Label><Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="Certificação Orgânica" /></div>
            <div className="space-y-2"><Label>Emissor</Label><Input value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="MAPA" /></div>
            <div className="space-y-2"><Label>Válido até</Label><Input type="date" value={certUntil} onChange={(e) => setCertUntil(e.target.value)} /></div>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
      </form>
    </Card>
  );
}