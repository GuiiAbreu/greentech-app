/* eslint-disable prettier/prettier */
import type { Farmer, Order, OrderItem, Product, User } from "@/lib/types";

export function normalizeUser(user: User): User {
  return {
    ...user,
    propertyName: user.propertyName ?? user.farmerProfile?.propertyName ?? null,
    address: user.address ?? user.farmerProfile?.address ?? null,
  };
}

export function normalizeFarmer(farmer?: Farmer | null): Farmer | undefined {
  if (!farmer) return undefined;

  return {
    ...farmer,
    propertyName: farmer.propertyName ?? farmer.farmerProfile?.propertyName ?? null,
    address: farmer.address ?? farmer.farmerProfile?.address ?? null,
  };
}

export function normalizeProduct(product: Product): Product {
  const photoUrls =
    product.photoUrls ?? product.photos?.map((photo) => photo.url).filter(Boolean) ?? [];

  const certs = product.certs ?? product.certifications ?? [];

  return {
    ...product,
    photoUrls,
    certs,
    certifications: certs,
    farmer: normalizeFarmer(product.farmer),
  };
}

export function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}

export function normalizeOrder(order: Order): Order {
  const items: OrderItem[] = order.items ?? [];

  const computedTotal = items.reduce((sum, item) => {
    const lineTotal =
      item.lineTotalCents ??
      (item.unitPriceCents ?? item.priceCents ?? item.product?.priceCents ?? 0) * item.qty;

    return sum + lineTotal;
  }, 0);

  return {
    ...order,
    farmer: normalizeFarmer(order.farmer),
    totalCents: order.totalCents ?? order.subtotalCents ?? computedTotal,
    items,
  };
}

export function normalizeOrders(orders: Order[]): Order[] {
  return orders.map(normalizeOrder);
}
