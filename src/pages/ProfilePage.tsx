import { Heart, Clock, Bell, Crown, ChevronRight, Settings, LogOut, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/balahub-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const menuItems = [
  { icon: Crown, label: "Подписка", desc: "Бесплатный план", badge: "FREE", color: "bg-yellow-light", iconColor: "text-primary", emoji: "👑" },
  { icon: Heart, label: "Избранные", desc: "3 кружка", badge: "3", color: "bg-pink-soft", iconColor: "text-accent", emoji: "❤️" },
  { icon: Clock, label: "История", desc: "Недавние просмотры", badge: "", color: "bg-blue-sky", iconColor: "text-secondary", emoji: "⏰" },
  { icon: Bell, label: "Уведомления", desc: "Новые события", badge: "2", color: "bg-green-light", iconColor: "text-green-fresh", emoji: "🔔" },
  { icon: Settings, label: "Настройки", desc: "Профиль и приватность", badge: "", color: "bg-muted", iconColor: "text-muted-foreground", emoji: "⚙️" },
];

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const phone = user?.user_metadata?.phone || user?.email?.replace("@phone.balahub.kz", "") || "";

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <div className="pt-8 pb-8 flex flex-col items-center rounded-b-[2rem]" style={{ background: "var(--gradient-header)" }}>
        <div className="w-22 h-22 rounded-3xl bg-card flex items-center justify-center overflow-hidden border-4 border-destructive" style={{ boxShadow: "var(--shadow-cartoon-lg)", width: "88px", height: "88px" }}>
          <img src={logo} alt="avatar" className="w-16 h-16 animate-dance" />
        </div>
        {user ? (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3 drop-shadow-sm">
              {user.user_metadata?.display_name || `User ${phone.slice(-4)}`}
            </h1>
            <p className="text-primary-foreground/70 text-xs font-bold">
              {phone ? `+${phone}` : "Алматы"}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3 drop-shadow-sm">👋 Гость</h1>
            <p className="text-primary-foreground/70 text-xs font-bold">Войдите для полного доступа</p>
          </>
        )}
      </div>

      {user && (
        <div className="mx-4 -mt-5 relative z-10 cartoon-card p-4 flex justify-around">
          {[{ v: "0", l: "Избранных", emoji: "💛" }, { v: "0", l: "Просмотров", emoji: "👁️" }, { v: "0", l: "Отзывов", emoji: "⭐" }].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-lg font-black text-accent">{s.v}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">{s.emoji} {s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 mt-4 flex flex-col gap-2">
        {!user && (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-3 bg-primary rounded-2xl p-3.5 cartoon-btn border-primary text-left"
            style={{ boxShadow: "var(--shadow-cartoon-lg)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <LogIn size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-primary-foreground">🚀 Войти / Регистрация</p>
              <p className="text-[10px] text-primary-foreground/60 font-bold">По номеру телефона</p>
            </div>
            <ChevronRight size={16} className="text-primary-foreground shrink-0" />
          </button>
        )}

        {menuItems.map((item) => (
          <button key={item.label}
            onClick={() => toast({ title: item.label, description: item.desc })}
            className="flex items-center gap-3 cartoon-card p-3.5 text-left">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 border-2 border-foreground/5`}>
              <item.icon size={18} className={item.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{item.label}</p>
              <p className="text-[10px] text-muted-foreground font-bold">{item.desc}</p>
            </div>
            {item.badge && <span className="text-[10px] font-black bg-accent/15 text-accent px-2.5 py-1 rounded-full border-2 border-accent/20">{item.badge}</span>}
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-[3px] border-destructive/30 text-destructive font-black text-sm active:scale-[0.97] transition-transform bg-destructive/5"
            style={{ boxShadow: "var(--shadow-cartoon)" }}
          >
            <LogOut size={14} />Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
