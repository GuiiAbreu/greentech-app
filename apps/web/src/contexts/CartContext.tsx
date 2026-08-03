import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";

export interface CartItem {
  productId: string;
  qty: number;
  product: Product;
}

interface CartCtx {
  items: CartItem[];
  farmerId: string | null;
  add: (p: Product, qty?: number) => { ok: boolean; reason?: string };
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalCents: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("greentech_cart");
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch { /* noop */ }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("greentech_cart", JSON.stringify(items));
  }, [items]);

  const farmerId = items[0]?.product?.farmer?.id ?? items[0]?.product?.farmerId ?? null;

  const add: CartCtx["add"] = (p, qty = 1) => {
    const pFarmer = p.farmer?.id ?? p.farmerId ?? null;
    if (farmerId && pFarmer && pFarmer !== farmerId) {
      return { ok: false, reason: "Seu carrinho já tem produtos de outro agricultor. Finalize ou limpe o carrinho." };
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) => i.productId === p.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { productId: p.id, qty, product: p }];
    });
    return { ok: true };
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.productId !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => p.map((i) => i.productId === id ? { ...i, qty: Math.max(1, qty) } : i));
  const clear = () => setItems([]);

  const totalCents = items.reduce((s, i) => s + i.product.priceCents * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, farmerId, add, remove, setQty, clear, totalCents, count }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
};