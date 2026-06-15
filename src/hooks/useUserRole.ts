import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "parent" | "club_owner" | "admin";

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

    const fetchRole = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roles = (data || []).map((r: any) => r.role as AppRole);
      let picked: AppRole | null = roles.includes("admin")
        ? "admin"
        : roles.includes("club_owner")
        ? "club_owner"
        : roles.includes("parent")
        ? "parent"
        : null;

      // Auto-assign "parent" role on first login so users skip the role selector.
      if (!picked) {
        const { error: insErr } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "parent" });
        if (!insErr || (insErr as any).code === "23505") {
          picked = "parent";
        }
      }

      setRole(picked);
      setLoading(false);
    };

    fetchRole();
  }, [user]);


  const assignRole = async (newRole: AppRole) => {
    if (!user) return null;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: newRole });
    if (error) {
      // Duplicate — role already exists, treat as success
      if ((error as any).code === "23505") {
        setRole(newRole);
        return null;
      }
      return error;
    }
    setRole(newRole);
    return null;
  };

  return { role, loading, assignRole };
};
