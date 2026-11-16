import { Bell, LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

const NotificationsPage = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            {t("profile.notifications")}
          </h1>
          {user && <p className="text-xs text-muted-foreground">{t("notifications.none")}</p>}
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {loading ? <Loader2 className="animate-spin text-primary" /> : !user ? <Button onClick={() => setAuthOpen(true)}><LogIn />{t("profile.login")}</Button> : <p className="py-8 text-sm text-muted-foreground">{t("notifications.none")}</p>}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} redirectTo="/notifications" />
    </div>
  );
};

export default NotificationsPage;
