import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearCart as clearStore, loadCart, saveCart } from "../storage/cart";

type CartItem = {
  productId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
  photoUrl?: string | null;
};

type FarmerRef = { farmerId: string; farmerName: string; farmerPhone: string };

type CartState = {
  farmer: FarmerRef | null;
  items: CartItem[];
};

type CartContextValue = {
  cart: CartState;
  addItem: (payload: { farmer: FarmerRef; item: Omit<CartItem, "qty">; qty?: number }) => Promise<"OK" | "DIFFERENT_FARMER">;
  setQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({ farmer: null, items: [] });

  useEffect(() => {
    (async () => {
      const stored = await loadCart();
      if (stored) setCart(stored);
    })();
  }, []);

  async function persist(next: CartState) {
    setCart(next);
    await saveCart(next);
  }

  async function addItem(payload: { farmer: FarmerRef; item: Omit<CartItem, "qty">; qty?: number }) {
    const qty = payload.qty ?? 1;
    if (cart.farmer && cart.farmer.farmerId !== payload.farmer.farmerId) {
      return "DIFFERENT_FARMER";
    }

    const existing = cart.items.find((i) => i.productId === payload.item.productId);
    const nextItems = existing
      ? cart.items.map((i) => (i.productId === payload.item.productId ? { ...i, qty: i.qty + qty } : i))
      : [...cart.items, { ...payload.item, qty }];

    await persist({ farmer: cart.farmer ?? payload.farmer, items: nextItems });
    return "OK";
  }

  async function setQty(productId: string, qty: number) {
    const nextItems = cart.items
      .map((i) => (i.productId === productId ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);

    const nextFarmer = nextItems.length ? cart.farmer : null;
    await persist({ farmer: nextFarmer, items: nextItems });
  }

  async function removeItem(productId: string) {
    await setQty(productId, 0);
  }

  async function clear() {
    await clearStore();
    setCart({ farmer: null, items: [] });
  }

  const subtotalCents = cart.items.reduce((acc, i) => acc + i.unitPriceCents * i.qty, 0);

  const value = useMemo(() => ({ cart, addItem, setQty, removeItem, clear, subtotalCents }), [cart, subtotalCents]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
