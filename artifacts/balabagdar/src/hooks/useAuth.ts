import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface AppUser {
  id: string;
  phone: string;
  displayName?: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
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
    loadUser();
  }, [loadUser]);

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

  return { user, session: user, loading, signOut, setUserFromLogin, reload: loadUser };
};
