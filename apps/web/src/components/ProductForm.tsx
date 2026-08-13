import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categoryLabel, unitLabel, reaisToCents } from "@/lib/format";
import type { Product, Certification, ProductCategory, UnitType } from "@/lib/types";
import { IMAGE_ACCEPT, getImageValidationMessage } from "@/lib/uploads";
import { ImageIcon } from "lucide-react";

type Payload = {
  name: string;
  description?: string;
  category: ProductCategory;
  priceCents: number;
  unit: UnitType;
  stockQty: number;
  active?: boolean;
};

type CertPayload = { title: string; issuer?: string; validUntil?: string };

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ProductForm({
  initial,
  initialCert,
  onSubmit,
}: {
  initial?: Product;
  initialCert?: Certification | null;
  onSubmit: (p: Payload, c?: CertPayload, image?: File | null) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "HORTALICAS");
  const [price, setPrice] = useState(
    initial ? (initial.priceCents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [unit, setUnit] = useState<UnitType>(initial?.unit ?? "KG");
  const [stockQty, setStockQty] = useState(String(initial?.stockQty ?? 0));
  const [active, setActive] = useState(initial?.active !== false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.photoUrls?.[0] ?? null);
  const [certTitle, setCertTitle] = useState(initialCert?.title ?? "");
  const [certIssuer, setCertIssuer] = useState(initialCert?.issuer ?? "");
  const [certUntil, setCertUntil] = useState(initialCert?.validUntil?.slice(0, 10) ?? "");
  const [loading, setLoading] = useState(false);

  const currentImageUrl = initial?.photoUrls?.[0] ?? null;

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(currentImageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, currentImageUrl]);

  const handleImageChange = (file?: File | null) => {
    if (!file) {
      setImageFile(null);
      return null;
    }

    const message = getImageValidationMessage(file);
    if (message) {
      toast.error(message);
      setImageFile(null);
      return message;
    }

    setImageFile(file);
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (certTitle.trim() && certUntil && certUntil < todayInputDate()) {
      toast.error("A validade da certificacao nao pode ser anterior a data atual");
      return;
    }

    setLoading(true);
    const payload: Payload = {
      name,
      description,
      category,
      priceCents: reaisToCents(price),
      unit,
      stockQty: Number(stockQty) || 0,
      active,
    };
    const certPayload = certTitle.trim()
      ? {
          title: certTitle.trim(),
          issuer: certIssuer.trim() || undefined,
          validUntil: certUntil ? new Date(`${certUntil}T00:00:00`).toISOString() : undefined,
        }
      : undefined;

    try {
      await onSubmit(payload, certPayload, imageFile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Descricao</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoryLabel) as ProductCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabel[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unidade</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as UnitType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(unitLabel) as UnitType[]).map((u) => (
                  <SelectItem key={u} value={u}>
                    {unitLabel[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preco (R$)</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Estoque</Label>
            <Input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              required
            />
          </div>
        </div>
        {initial && (
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={active} onCheckedChange={setActive} /> Produto ativo
          </label>
        )}
        <div className="space-y-2">
          <Label htmlFor="product-image">Imagem principal</Label>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-md border bg-muted">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={name || "Produto"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Input
                id="product-image"
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={(e) => {
                  const message = handleImageChange(e.target.files?.[0]);
                  if (message) e.currentTarget.value = "";
                }}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP ate 2 MB.</p>
              {imageFile && <p className="text-xs text-muted-foreground">{imageFile.name}</p>}
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Certificacao (opcional)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Titulo</Label>
              <Input
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                placeholder="Certificacao Organica"
              />
            </div>
            <div className="space-y-2">
              <Label>Emissor</Label>
              <Input
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
                placeholder="MAPA"
              />
            </div>
            <div className="space-y-2">
              <Label>Valido ate</Label>
              <Input
                type="date"
                value={certUntil}
                min={todayInputDate()}
                onChange={(e) => setCertUntil(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
