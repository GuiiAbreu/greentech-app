import type { OrderStatus, ProductCategory, UnitType, DeliveryMethod } from "./types";

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const reaisToCents = (v: string | number) => {
  if (typeof v === "number") return Math.round(v * 100);
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Math.round((isNaN(n) ? 0 : n) * 100);
};

export const categoryLabel: Record<ProductCategory, string> = {
  FRUTAS: "Frutas",
  HORTALICAS: "Hortaliças",
  LATICINIOS: "Laticínios",
  OVOS: "Ovos",
  GRAOS: "Grãos",
};

export const unitLabel: Record<UnitType, string> = {
  BANDEJA: "Bandeja",
  KG: "Kg",
  UNIDADE: "Unidade",
  MACO: "Maço",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DONE: "Concluído",
  CANCELED: "Cancelado",
};

export const deliveryLabel: Record<DeliveryMethod, string> = {
  DELIVERY: "Receber em casa",
  PICKUP: "Retirar no local",
};

export const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
};
