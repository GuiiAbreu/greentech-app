import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "@/services/api";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isReady: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: UpdateProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  propertyName?: string;
  address?: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  city?: string;
  propertyName?: string;
  address?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isReady: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        set({ token });
        const { data } = await api.get<User>("/me");
        set({ user: data, isReady: true });
      } else {
        set({ isReady: true });
      }
    } catch {
      await SecureStore.deleteItemAsync("token").catch(() => {});
      set({ user: null, token: null, isReady: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });
      await SecureStore.setItemAsync("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ token: string; user: User }>(
        "/auth/register",
        registerData
      );
      await SecureStore.setItemAsync("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token").catch(() => {});
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get<User>("/me");
      set({ user: data });
    } catch {
      // ignore
    }
  },

  updateUser: async (updateData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put<User>("/me", updateData);
      set({ user: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true });
    try {
      await api.put("/me/password", { currentPassword, newPassword });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
