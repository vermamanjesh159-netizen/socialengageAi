import { create } from "zustand";
import { api } from "../lib/api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  comments_used_this_month: number;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
}

export const DEFAULT_GUEST_USER: User = {
  id: 1,
  email: "guest@aicontentgenerator.ai",
  full_name: "Local User",
  plan: "Unlimited",
  comments_used_this_month: 0,
  is_active: true,
  is_verified: true,
  is_admin: true
};

interface AuthState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_GUEST_USER,
  loading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  login: async (accessToken, refreshToken) => {
    set({ loading: true });
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    try {
      const resp = await api.get("/users/me");
      set({ user: resp.data, loading: false });
    } catch (err) {
      set({ user: DEFAULT_GUEST_USER, loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: DEFAULT_GUEST_USER, loading: false });
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  },
  checkAuth: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      set({ user: DEFAULT_GUEST_USER, loading: false, isInitialized: true });
      return;
    }
    try {
      const resp = await api.get("/users/me");
      set({ user: resp.data, loading: false, isInitialized: true });
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ user: DEFAULT_GUEST_USER, loading: false, isInitialized: true });
    }
  },
  updateUser: async (userData) => {
    set({ loading: true });
    try {
      const resp = await api.put("/users/me", userData);
      set({ user: resp.data, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));
