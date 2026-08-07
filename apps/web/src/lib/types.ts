export type Role = "FARMER" | "CONSUMER";

export type ProductCategory = "FRUTAS" | "HORTALICAS" | "LATICINIOS" | "OVOS" | "GRAOS";
export type UnitType = "BANDEJA" | "KG" | "UNIDADE" | "MACO";
export type DeliveryMethod = "DELIVERY" | "PICKUP";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DONE" | "CANCELED";

export interface FarmerProfile {
  propertyName?: string | null;
  address?: string | null;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  propertyName?: string | null;
  address?: string | null;
  farmerProfile?: FarmerProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Farmer {
  id: string;
  name: string;
  city?: string;
  phone?: string;
  propertyName?: string | null;
  address?: string | null;
  farmerProfile?: FarmerProfile | null;
}

export interface ProductPhoto {
  id?: string;
  productId?: string;
  url: string;
  createdAt?: string;
}

export interface Certification {
  id: string;
  productId: string;
  title: string;
  issuer?: string | null;
  validUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  photos?: ProductPhoto[];
  certs?: Certification[];
  certifications?: Certification[];
  farmer?: Farmer;
  farmerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  qty: number;
  product?: Product;
  productName?: string;
  unitPriceCents?: number;
  priceCents?: number;
  lineTotalCents?: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string | null;
  note?: string | null;
  totalCents?: number;
  subtotalCents?: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  farmer?: Farmer;
  consumer?: {
    id: string;
    name: string;
    phone?: string;
    city?: string;
  };
}
