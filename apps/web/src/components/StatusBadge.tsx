import { Badge } from "@/components/ui/badge";
import { orderStatusLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  DONE: "bg-green-100 text-green-800 border-green-200",
  CANCELED: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {orderStatusLabel[status]}
    </Badge>
  );
}