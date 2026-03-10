import { createContext, useContext, useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/stores/authStore";

type AuthContextType = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  token: string | null;
  setSession: (payload: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const loading = useAuthStore((state) => state.loading);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const logout = useAuthStore((state) => state.logout);

 
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{ token, user, isLoggedIn, setSession, clearSession, setIsLoggedIn, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuth };
