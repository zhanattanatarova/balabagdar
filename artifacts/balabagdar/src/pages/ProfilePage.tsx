import { Heart, Clock, Bell, ChevronRight, LogOut, LogIn, MessageCircle, Building2, Shield, ExternalLink, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

const SUPPORT_TELEGRAM = "https://t.me/balabagdar_support";
const SUPPORT_WHATSAPP = "https://wa.me/77001234567";

const ContactModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up border-t-[4px] border-x-[4px] border-primary p-5 pb-8">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">{t("contact.title")}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
            <X size={16} className="text-destructive" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground font-bold mb-4">{t("contact.desc")}</p>
        <div className="flex flex-col gap-3">
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{t("contact.telegram")}</p>
              <p className="text-xs text-muted-foreground font-bold">@balabagdar_support</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground" />
          </a>
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border-2 border-green-200 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{t("contact.whatsapp")}</p>
              <p className="text-xs text-muted-foreground font-bold">+7 700 123 4567</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const phone = (user as any)?.phone || "";

  const menuItems = [
    { icon: Heart, label: t("profile.favorites"), color: "bg-destructive/10", iconColor: "text-destructive", action: () => toast({ title: t("profile.favorites") }) },
    { icon: Clock, label: t("profile.history"), color: "bg-secondary/10", iconColor: "text-secondary", action: () => toast({ title: t("profile.history") }) },
    { icon: Bell, label: t("profile.notifications"), color: "bg-primary/10", iconColor: "text-primary", action: () => toast({ title: t("profile.notifications") }) },
  ];

  const settingsItems = [
    { icon: MessageCircle, label: t("profile.contact_us"), color: "bg-primary/10", iconColor: "text-primary", action: () => setShowContact(true) },
    { icon: Shield, label: t("profile.legal"), color: "bg-amber-100", iconColor: "text-amber-600", action: () => navigate("/legal") },
  ];

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <ContactModal open={showContact} onClose={() => setShowContact(false)} />

      <div className="pt-8 pb-10 flex flex-col items-center rounded-b-[2rem]" style={{ background: "var(--gradient-header)" }}>
        <div className="border-4 border-primary-foreground/30 rounded-full" style={{ boxShadow: "var(--shadow-cartoon-lg)" }}>
          <BrandLogo size="lg" />
        </div>
        {user ? (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">
              {user.displayName || `User ${phone.slice(-4)}`}
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

        <h3 className="text-sm font-black mb-2 px-1">{t("profile.menu")}</h3>
        <div className="cartoon-card p-1 mb-4">
          {menuItems.map((item) => (
            <button key={item.label} onClick={item.action}
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
            <button key={item.label} onClick={item.action}
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
