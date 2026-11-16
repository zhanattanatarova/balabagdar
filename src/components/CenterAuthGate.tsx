import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";

export default function CenterAuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (user) return <>{children}</>;

  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
    <h1 className="text-lg font-bold">{t("dashboard.create_club")}</h1>
    <Button onClick={() => setOpen(true)}><LogIn />{t("profile.login")}</Button>
    <AuthModal open={open} onClose={() => setOpen(false)} redirectTo={pathname} defaultRegisterRole="club_owner" />
  </div>;
}