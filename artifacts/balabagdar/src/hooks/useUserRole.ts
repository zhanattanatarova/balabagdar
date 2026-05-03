import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

export type AppRole = "parent" | "club_owner";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    api.auth.me().then(({ role: r }) => {
      setRole((r as AppRole) || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const assignRole = async (newRole: AppRole) => {
    if (!user) return;
    try {
      await api.auth.assignRole(newRole);
      setRole(newRole);
    } catch (err) {
      return err;
    }
  };

  return { role, loading, assignRole };
};
