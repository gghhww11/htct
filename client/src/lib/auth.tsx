import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import type { User, AuthState } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.check();
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    await checkAuth();
    navigate("/admin/dashboard");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate("/admin/login");
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
