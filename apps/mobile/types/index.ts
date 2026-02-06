export type UserRole = "FARMER" | "CONSUMER";

export type ProductCategory =
  | "FRUTAS"
  | "HORTALICAS"
  | "LATICINIOS"
  | "OVOS"
  | "GRAOS";

export type UnitType = "BANDEJA" | "KG" | "UNIDADE" | "MACO";

export type DeliveryMethod = "DELIVERY" | "PICKUP";

export type OrderStatus = "PENDING" | "CONFIRMED" | "DONE" | "CANCELED";

export interface FarmerProfile {
  propertyName: string;
  address: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  city: string;
  farmerProfile: FarmerProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPhoto {
  id: string;
  productId: string;
  url: string;
  createdAt: string;
}

export interface Certification {
  id: string;
  productId: string;
  title: string;
  issuer: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  farmerId: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
  unit: UnitType;
  stockQty: number;
  active: boolean;
  photos: ProductPhoto[];
  certs: Certification[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogProduct extends Product {
  farmer: {
    id: string;
    name: string;
    city: string;
    phone: string;
    propertyName: string | null;
  };
}

export interface CatalogProductDetail extends Product {
  farmer: {
    id: string;
    name: string;
    city: string;
    phone: string;
    propertyName: string | null;
    address: string | null;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  createdAt: string;
}

export interface Order {
  id: string;
  consumerId: string;
  farmerId: string;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  subtotalCents: number;
  note: string | null;
  items: OrderItem[];
  farmer: {
    id: string;
    name: string;
    phone: string;
    city: string;
    propertyName: string | null;
    address: string | null;
  };
  consumer: {
    id: string;
    name: string;
    phone: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: CatalogProduct;
  qty: number;
}

export interface FarmerCatalog {
  id: string;
  name: string;
  city: string;
  phone: string;
  propertyName: string | null;
  address: string | null;
  activeProductsCount: number;
}

// Helpers
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  FRUTAS: "Frutas",
  HORTALICAS: "Hortali\u00e7as",
  LATICINIOS: "Latic\u00ednios",
  OVOS: "Ovos",
  GRAOS: "Gr\u00e3os",
};

export const UNIT_LABELS: Record<UnitType, string> = {
  BANDEJA: "Bandeja",
  KG: "Kg",
  UNIDADE: "Unidade",
  MACO: "Ma\u00e7o",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DONE: "Conclu\u00eddo",
  CANCELED: "Cancelado",
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  DELIVERY: "Entrega",
  PICKUP: "Retirada",
};

export function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}
