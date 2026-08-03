import { api } from "./client";

export async function loginApi(payload: { email: string; password: string }) {
  const res = await api.post("/auth/login", payload);
  return res.data as { token: string; user: any };
}

export async function registerApi(payload: any) {
  const res = await api.post("/auth/register", payload);
  return res.data as { token: string; user: any };
}