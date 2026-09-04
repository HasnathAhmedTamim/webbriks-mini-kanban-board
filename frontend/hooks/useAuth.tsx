"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authStorage, type StoredUser } from "@/lib/auth";
import type { AuthResponse } from "@/types";

type AuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authStorage.getUser());
    setToken(authStorage.getToken());
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      async login(email, password) {
        const { data } = await api.post<{ data: AuthResponse }>("/auth/login", {
          email,
          password,
        });
        authStorage.setSession(data.data.token, data.data.user);
        // Drop any previous user's cached boards before loading the new session.
        queryClient.clear();
        setUser(data.data.user);
        setToken(data.data.token);
      },
      async register(name, email, password) {
        const { data } = await api.post<{ data: AuthResponse }>("/auth/register", {
          name,
          email,
          password,
        });
        authStorage.setSession(data.data.token, data.data.user);
        queryClient.clear();
        setUser(data.data.user);
        setToken(data.data.token);
      },
      logout() {
        authStorage.clear();
        setUser(null);
        setToken(null);
        queryClient.clear();
      },
    }),
    [user, token, isLoading, queryClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
