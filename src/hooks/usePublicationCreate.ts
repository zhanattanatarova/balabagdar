import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function usePublicationCreate(onCreate: () => void) {
  const { user, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const requested = params.get("action") === "create";
  useEffect(() => {
    if (loading || (!pending && !requested)) return;
    if (!user) { setAuthOpen(true); return; }
    setAuthOpen(false);
    setPending(false);
    if (requested) {
      const next = new URLSearchParams(params);
      next.delete("action");
      setParams(next, { replace: true });
    }
    onCreate();
  }, [user, loading, pending, requested]);
  return {
    authOpen,
    requestCreate: () => { if (user) onCreate(); else { setPending(true); setAuthOpen(true); } },
    closeAuth: () => {
      setAuthOpen(false);
      if (!user) {
        setPending(false);
        if (requested) { const next = new URLSearchParams(params); next.delete("action"); setParams(next, { replace: true }); }
      }
    },
  };
}