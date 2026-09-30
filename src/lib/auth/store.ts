"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, TokenPair, Role } from "@/types";
import { setTokens, clearTokens } from "@/lib/api/client";

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  setAuth: (user: AuthUser, tokens: TokenPair) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Derived getters
  isAuthenticated: () => boolean;
  hasRole: (role: Role) => boolean;
  canAccess: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, tokens) => {
        setTokens(tokens);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setLoading: (isLoading) => set({ isLoading }),

      isAuthenticated: () => !!get().user && !!get().accessToken,

      hasRole: (role) => get().user?.role === role,

      canAccess: (roles) => {
        const userRole = get().user?.role;
        if (!userRole) return false;
        return roles.includes(userRole as Role);
      },
    }),
    {
      name: "logiflow-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        }
      ),
      // Only persist user and tokens — isLoading is transient
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
