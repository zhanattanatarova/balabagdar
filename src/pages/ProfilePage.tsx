import { Heart, Clock, Bell, ChevronRight, Settings, LogOut, LogIn, CreditCard, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/balahub-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const menuItems = [
  { icon: Heart, label: "Избранное", color: "bg-destructive/10", iconColor: "text-destructive" },
  { icon: Clock, label: "История просмотров", color: "bg-secondary/10", iconColor: "text-secondary" },
  { icon: Bell, label: "Уведомления", color: "bg-primary/10", iconColor: "text-primary" },
];

const settingsItems = [
  { icon: CreditCard, label: "Пополнить подписку", color: "bg-secondary/10", iconColor: "text-secondary" },
  { icon: MessageCircle, label: "Связаться с нами", color: "bg-primary/10", iconColor: "text-primary" },
];

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const phone = user?.user_metadata?.phone || user?.email?.replace("@phone.balahub.kz", "") || "";

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Header */}
      <div className="pt-8 pb-10 flex flex-col items-center rounded-b-[2rem]" style={{ background: "var(--gradient-header)" }}>
        <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center overflow-hidden border-4 border-primary-foreground/30" style={{ boxShadow: "var(--shadow-cartoon-lg)" }}>
          <img src={logo} alt="avatar" className="w-14 h-14" />
        </div>
        {user ? (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">
              {user.user_metadata?.display_name || `User ${phone.slice(-4)}`}
            </h1>
            <p className="text-primary-foreground/70 text-xs font-bold mt-0.5">
              Подписка: 1000 ₸ в месяц
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">👋 Гость</h1>
            <p className="text-primary-foreground/70 text-xs font-bold mt-0.5">Войдите для полного доступа</p>
          </>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 -mt-5 relative z-10">
        {!user && (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full flex items-center gap-3 bg-primary rounded-2xl p-3.5 mb-3 text-left cartoon-card border-primary"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <LogIn size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-primary-foreground">Войти / Регистрация</p>
              <p className="text-[10px] text-primary-foreground/60 font-bold">По номеру телефона</p>
            </div>
            <ChevronRight size={16} className="text-primary-foreground shrink-0" />
          </button>
        )}

        <div className="cartoon-card p-1 mb-4">
          {menuItems.map((item, i) => (
            <button key={item.label}
              onClick={() => toast({ title: item.label })}
              className="flex items-center gap-3 p-3 text-left w-full hover:bg-muted/50 rounded-xl transition-colors">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon size={18} className={item.iconColor} />
              </div>
              <span className="flex-1 font-bold text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <h3 className="text-sm font-black mb-2 px-1">Мои настройки</h3>
        <div className="cartoon-card p-1">
          {settingsItems.map((item) => (
            <button key={item.label}
              onClick={() => toast({ title: item.label })}
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
          <button
            onClick={async () => {
              await signOut();
              toast({ title: "Вы вышли", description: "До встречи! 👋" });
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-destructive/30 text-destructive font-bold text-sm active:scale-[0.97] transition-transform bg-destructive/5"
          >
            <LogOut size={14} />Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
