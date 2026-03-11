import { Heart, Clock, Bell, Crown, ChevronRight, Settings, LogOut, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/balahub-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const menuItems = [
  { icon: Crown, label: "Подписка", desc: "Бесплатный план", badge: "FREE", color: "bg-primary/15", iconColor: "text-primary" },
  { icon: Heart, label: "Избранные", desc: "3 кружка", badge: "3", color: "bg-pink-soft", iconColor: "text-accent" },
  { icon: Clock, label: "История", desc: "Недавние просмотры", badge: "", color: "bg-blue-sky", iconColor: "text-secondary" },
  { icon: Bell, label: "Уведомления", desc: "Новые события", badge: "2", color: "bg-green-light", iconColor: "text-green-fresh" },
  { icon: Settings, label: "Настройки", desc: "Профиль и приватность", badge: "", color: "bg-muted", iconColor: "text-muted-foreground" },
];

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const phone = user?.user_metadata?.phone || user?.email?.replace("@phone.balahub.kz", "") || "";

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <div className="pt-8 pb-6 flex flex-col items-center" style={{ background: "var(--gradient-header)" }}>
        <div className="w-20 h-20 rounded-3xl bg-card shadow-xl flex items-center justify-center overflow-hidden border-4 border-primary-foreground/20">
          <img src={logo} alt="avatar" className="w-14 h-14" />
        </div>
        {user ? (
          <>
            <h1 className="text-lg font-black text-primary-foreground mt-3">
              {user.user_metadata?.display_name || `User ${phone.slice(-4)}`}
            </h1>
            <p className="text-primary-foreground/60 text-xs font-semibold">
              {phone ? `+${phone}` : "Алматы"}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-black text-primary-foreground mt-3">Гость</h1>
            <p className="text-primary-foreground/60 text-xs font-semibold">Войдите для полного доступа</p>
          </>
        )}
      </div>

      {user && (
        <div className="mx-4 -mt-4 relative z-10 bg-card rounded-xl shadow-sm border border-border p-3.5 flex justify-around">
          {[{ v: "0", l: "Избранных" }, { v: "0", l: "Просмотров" }, { v: "0", l: "Отзывов" }].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-base font-black text-accent">{s.v}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 mt-4 flex flex-col gap-1.5">
        {!user && (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-3 bg-primary rounded-xl p-3 hover:brightness-105 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <LogIn size={16} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-primary-foreground">Войти / Регистрация</p>
              <p className="text-[10px] text-primary-foreground/60">По номеру телефона</p>
            </div>
            <ChevronRight size={14} className="text-primary-foreground shrink-0" />
          </button>
        )}

        {menuItems.map((item) => (
          <button key={item.label}
            onClick={() => toast({ title: item.label, description: item.desc })}
            className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50 hover:bg-muted/50 active:scale-[0.98] transition-all text-left">
            <div className="w-9 h-9 rounded-lg bg-yellow-light flex items-center justify-center shrink-0">
              <item.icon size={16} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            {item.badge && <span className="text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-full">{item.badge}</span>}
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {user && (
        <div className="px-4 mt-5">
          <button
            onClick={async () => {
              await signOut();
              toast({ title: "Вы вышли", description: "До встречи! 👋" });
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/20 text-destructive font-bold text-sm active:scale-[0.97] transition-transform"
          >
            <LogOut size={14} />Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
