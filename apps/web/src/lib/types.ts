export type Role = "FARMER" | "CONSUMER";

export type ProductCategory = "FRUTAS" | "HORTALICAS" | "LATICINIOS" | "OVOS" | "GRAOS";
export type UnitType = "BANDEJA" | "KG" | "UNIDADE" | "MACO";
export type DeliveryMethod = "DELIVERY" | "PICKUP";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DONE" | "CANCELED";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  propertyName?: string;
  address?: string;
}

export interface Farmer {
  id: string;
  name: string;
  city?: string;
  phone?: string;
  propertyName?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  priceCents: number;
  unit: UnitType;
  stockQty: number;
  active?: boolean;
  photoUrls?: string[];
  farmer?: Farmer;
  farmerId?: string;
}

export interface Certification {
  id: string;
  productId: string;
  title: string;
  issuer: string;
  validUntil: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  qty: number;
  product?: Product;
  priceCents?: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  note?: string;
  totalCents?: number;
  createdAt: string;
  items: OrderItem[];
  farmer?: Farmer;
  consumer?: { id: string; name: string; phone?: string };
}