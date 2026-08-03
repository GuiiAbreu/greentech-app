import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "./LoadingState";
import type { Role } from "@/lib/types";

export function ProtectedRoute({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (role && user.role !== role) {
      navigate({ to: user.role === "FARMER" ? "/agricultor/dashboard" : "/consumidor/home" });
    }
  }, [user, loading, role, navigate]);

  if (loading || !user || (role && user.role !== role)) return <LoadingState />;
  return <>{children}</>;
}