import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserPublic } from "@shared/api";
import { api } from "@/lib/api";

interface AuthContextValue {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserPublic>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await api.auth.me();
        return res.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  const user = data ?? null;

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password });
      queryClient.setQueryData(["auth", "me"], res.user);
      return res.user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (form: {
      email: string;
      password: string;
      name: string;
      phone?: string;
    }) => {
      await api.auth.register(form);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await api.auth.logout();
    queryClient.setQueryData(["auth", "me"], null);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      refresh: () => refetch(),
    }),
    [user, isLoading, login, register, logout, refetch],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
