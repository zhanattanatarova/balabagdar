import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

export interface AppUser {
  id: string;
  phone: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUserFromLogin: (u: AppUser, token: string) => void;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const token = localStorage.getItem("balahub_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      localStorage.removeItem("balahub_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const signOut = async () => {
    try {
      await api.auth.signOut();
    } catch {}
    localStorage.removeItem("balahub_token");
    setUser(null);
  };

  const setUserFromLogin = (u: AppUser, token: string) => {
    localStorage.setItem("balahub_token", token);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUserFromLogin, reload }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
