import { create } from "zustand";
import type { CartItem, CatalogProduct } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: CatalogProduct, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getFarmerId: () => string | null;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, qty = 1) => {
    const { items } = get();

    // Cart must only contain products from the same farmer
    if (items.length > 0 && items[0].product.farmerId !== product.farmerId) {
      // Clear cart and add new farmer's product
      set({ items: [{ product, qty }] });
      return;
    }

    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stockQty) }
            : i
        ),
      });
    } else {
      set({ items: [...items, { product, qty }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) });
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId
          ? { ...i, qty: Math.min(qty, i.product.stockQty) }
          : i
      ),
    });
  },

  clear: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.product.priceCents * i.qty, 0),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  getFarmerId: () => {
    const { items } = get();
    return items.length > 0 ? items[0].product.farmerId : null;
  },
}));
