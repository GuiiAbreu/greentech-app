import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/agricultor/pedidos")({
  component: PedidosLayout,
});

function PedidosLayout() {
  return <Outlet />;
}
