import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/consumidor/pedidos")({
  component: PedidosLayout,
});

function PedidosLayout() {
  return <Outlet />;
}
