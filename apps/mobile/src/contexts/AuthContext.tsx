import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { loginApi, registerApi } from "../api/auth";
import { clearToken, getToken, setToken } from "../storage/token";

type Role = "FARMER" | "CONSUMER";

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  city: string;
  farmerProfile?: { propertyName: string; address: string } | null;
};

type AuthContextValue = {
  status: "loading" | "ready";
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        setTokenState(t);
        api.defaults.headers.common.Authorization = `Bearer ${t}`;
        try {
          const me = await api.get<User>("/me");
          setUser(me.data);
        } catch {
          await clearToken();
          setTokenState(null);
          setUser(null);
        }
      }
      setStatus("ready");
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const { token: t, user } = await loginApi({ email, password });
    await setToken(t);
    setTokenState(t);
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
    setUser(user);
  }

  async function signUp(payload: any) {
    const { token: t, user } = await registerApi(payload);
    await setToken(t);
    setTokenState(t);
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
    setUser(user);
  }

  async function signOut() {
    await clearToken();
    setTokenState(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
  }

  const value = useMemo(() => ({ status, user, token, signIn, signUp, signOut }), [status, user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}