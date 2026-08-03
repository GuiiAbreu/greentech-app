import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import type { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("greentech_token");
    const u = localStorage.getItem("greentech_user");
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch { /* noop */ }
    }
    if (t) {
      api.get("/me").then((r) => {
        setUser(r.data);
        localStorage.setItem("greentech_user", JSON.stringify(r.data));
      }).catch(() => {
        localStorage.removeItem("greentech_token");
        localStorage.removeItem("greentech_user");
        setToken(null);
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem("greentech_token", t);
    localStorage.setItem("greentech_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login: AuthCtx["login"] = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const t = res.data.token ?? res.data.access_token;
    let u: User = res.data.user;
    if (!u) {
      localStorage.setItem("greentech_token", t);
      const me = await api.get("/me");
      u = me.data;
    }
    persist(t, u);
    return u;
  };

  const register: AuthCtx["register"] = async (data) => {
    const res = await api.post("/auth/register", data);
    const t = res.data.token ?? res.data.access_token;
    let u: User = res.data.user;
    if (t && !u) {
      localStorage.setItem("greentech_token", t);
      const me = await api.get("/me");
      u = me.data;
    }
    if (t) persist(t, u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("greentech_token");
    localStorage.removeItem("greentech_user");
    localStorage.removeItem("greentech_cart");
    setUser(null);
    setToken(null);
  };

  const refresh = async () => {
    const r = await api.get("/me");
    setUser(r.data);
    localStorage.setItem("greentech_user", JSON.stringify(r.data));
  };

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, logout, refresh, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
};