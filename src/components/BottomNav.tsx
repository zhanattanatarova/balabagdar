import { Home, MapPin, Calendar, User, Building2, Megaphone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole } from "@/hooks/useUserRole";
import LanguageSwitcher from "./LanguageSwitcher";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { role } = useUserRole();

  const tabs = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/map", icon: Building2, label: t("nav.map") },
    { path: "/board", icon: Megaphone, label: t("nav.board") },
    { path: "/news", icon: Calendar, label: t("nav.events") },
    { path: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      <LanguageSwitcher />
      <nav>
        <div className="flex items-center gap-1 bg-card/95 backdrop-blur-xl border border-border rounded-2xl px-2 py-2" style={{ boxShadow: "0 4px 24px hsl(0 0% 0% / 0.12)" }}>
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${active ? "bg-primary" : "hover:bg-muted"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-primary-foreground" : "text-muted-foreground"} />
                <span className={`text-[10px] font-bold ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
