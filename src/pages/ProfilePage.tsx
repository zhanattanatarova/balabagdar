import { Heart, Clock, Bell, ChevronRight, LogOut, LogIn, MessageCircle, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const phone = user?.user_metadata?.phone || user?.email?.replace("@phone.balahub.kz", "") || "";

  const menuItems = [
    { icon: Heart, label: t("profile.favorites"), color: "bg-destructive/10", iconColor: "text-destructive" },
    { icon: Clock, label: t("profile.history"), color: "bg-secondary/10", iconColor: "text-secondary" },
    { icon: Bell, label: t("profile.notifications"), color: "bg-primary/10", iconColor: "text-primary" },
  ];

  const settingsItems = [
    { icon: MessageCircle, label: t("profile.contact_us"), color: "bg-primary/10", iconColor: "text-primary" },
  ];

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      <div className="pt-8 pb-10 flex flex-col items-center rounded-b-[2rem]" style={{ background: "var(--gradient-header)" }}>
        <div className="border-4 border-primary-foreground/30 rounded-full" style={{ boxShadow: "var(--shadow-cartoon-lg)" }}>
          <BrandLogo size="lg" />
        </div>
        {user ? (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">
              {user.user_metadata?.display_name || `User ${phone.slice(-4)}`}
            </h1>
            <p className="text-primary-foreground/70 text-xs font-bold mt-0.5">{t("profile.free_access")}</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">{t("profile.guest")}</h1>
            <p className="text-primary-foreground/70 text-xs font-bold mt-0.5">{t("profile.guest_desc")}</p>
          </>
        )}
      </div>

      <div className="px-4 -mt-5 relative z-10">
        {!user && (
          <button onClick={() => setShowAuth(true)}
            className="w-full flex items-center gap-3 bg-primary rounded-2xl p-3.5 mb-3 text-left cartoon-card border-primary">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <LogIn size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-primary-foreground">{t("profile.login")}</p>
              <p className="text-[10px] text-primary-foreground/60 font-bold">{t("profile.login_desc")}</p>
            </div>
            <ChevronRight size={16} className="text-primary-foreground shrink-0" />
          </button>
        )}

        {user && role === "club_owner" && (
          <button onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 bg-secondary rounded-2xl p-3.5 mb-3 text-left cartoon-card border-secondary">
            <div className="w-10 h-10 rounded-xl bg-secondary-foreground/20 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-secondary-foreground">{t("dashboard.my_club")}</p>
              <p className="text-[10px] text-secondary-foreground/60 font-bold">{t("dashboard.edit_profile")}</p>
            </div>
            <ChevronRight size={16} className="text-secondary-foreground shrink-0" />
          </button>
        )}

        <div className="cartoon-card p-1 mb-4">
          {menuItems.map((item) => (
            <button key={item.label} onClick={() => toast({ title: item.label })}
              className="flex items-center gap-3 p-3 text-left w-full hover:bg-muted/50 rounded-xl transition-colors">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon size={18} className={item.iconColor} />
              </div>
              <span className="flex-1 font-bold text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <h3 className="text-sm font-black mb-2 px-1">{t("profile.settings")}</h3>
        <div className="cartoon-card p-1">
          {settingsItems.map((item) => (
            <button key={item.label} onClick={() => toast({ title: item.label })}
              className="flex items-center gap-3 p-3 text-left w-full hover:bg-muted/50 rounded-xl transition-colors">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon size={18} className={item.iconColor} />
              </div>
              <span className="flex-1 font-bold text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {user && (
        <div className="px-4 mt-5">
          <button onClick={async () => { await signOut(); toast({ title: t("common.logged_out"), description: t("common.bye") }); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-destructive/30 text-destructive font-bold text-sm active:scale-[0.97] transition-transform bg-destructive/5">
            <LogOut size={14} />{t("profile.logout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
