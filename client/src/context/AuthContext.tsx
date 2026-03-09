import { createContext, useContext, useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";

type AuthContextType = {
  isLoggedIn: boolean | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const loading = useAuthStore((state) => state.loading);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const logout = useAuthStore((state) => state.logout);

 
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout, loading }}>
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
