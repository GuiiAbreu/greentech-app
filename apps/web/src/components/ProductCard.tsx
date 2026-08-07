import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, unitLabel, categoryLabel } from "@/lib/format";
import type { Product } from "@/lib/types";
import { MapPin, ShoppingCart } from "lucide-react";

export function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd?: (p: Product) => void;
}) {
  const img = product.photoUrls?.[0] ?? "/images/produto-placeholder.jpg";
  return (
    <Card className="overflow-hidden p-0 transition-shadow hover:shadow-md">
      <Link
        to="/consumidor/produtos/$id"
        params={{ id: product.id }}
        className="block aspect-square overflow-hidden bg-muted"
      >
        <img src={img} alt={product.name} className="h-full w-full object-cover" />
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {categoryLabel[product.category]}
          </Badge>
        </div>
        {(product.farmer?.propertyName || product.farmer?.name) && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.farmer?.propertyName ?? product.farmer?.name}
          </p>
        )}
        {product.farmer?.city && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {product.farmer.city}
          </p>
        )}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-lg font-bold text-primary">{formatBRL(product.priceCents)}</p>
            <p className="text-xs text-muted-foreground">por {unitLabel[product.unit]}</p>
          </div>
          {onAdd && (
            <Button size="sm" onClick={() => onAdd(product)} disabled={product.stockQty <= 0}>
              <ShoppingCart className="h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
