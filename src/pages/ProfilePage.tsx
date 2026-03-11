import { Heart, Clock, Bell, Crown, ChevronRight, Settings, LogOut, Star } from "lucide-react";
import logo from "@/assets/balahub-logo.png";

const stats = [
  { value: "3", label: "Избранных" },
  { value: "12", label: "Просмотров" },
  { value: "2", label: "Отзыва" },
];

const menuItems = [
  { icon: Crown, label: "Подписка", desc: "Бесплатный план", badge: "FREE", badgeColor: "bg-secondary text-secondary-foreground" },
  { icon: Heart, label: "Избранные кружки", desc: "3 сохранённых кружка", badge: "3", badgeColor: "bg-accent text-accent-foreground" },
  { icon: Clock, label: "История просмотров", desc: "Недавние просмотры", badge: "", badgeColor: "" },
  { icon: Bell, label: "Уведомления", desc: "Новые события и акции", badge: "2", badgeColor: "bg-accent text-accent-foreground" },
  { icon: Settings, label: "Настройки", desc: "Профиль и приватность", badge: "", badgeColor: "" },
];

const ProfilePage = () => {
  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Profile header */}
      <div className="relative h-48 overflow-hidden" style={{
        background: "linear-gradient(160deg, hsl(152, 60%, 40%) 0%, hsl(42, 100%, 55%) 100%)"
      }}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full bg-primary-foreground/5" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className="w-20 h-20 rounded-3xl bg-card shadow-xl flex items-center justify-center overflow-hidden border-4 border-primary-foreground/20">
            <img src={logo} alt="avatar" className="w-14 h-14" />
          </div>
          <h1 className="text-xl font-black text-primary-foreground mt-3">Айгерим</h1>
          <p className="text-primary-foreground/70 text-sm font-semibold">Алматы · 2 ребёнка</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 -mt-5 relative z-10 bg-card rounded-2xl shadow-lg border border-border/50 p-4 flex justify-around">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg font-black text-primary">{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 flex flex-col gap-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="flex items-center gap-3 bg-card rounded-2xl p-3.5 border border-border/50 shadow-sm hover:shadow-md transition-all text-left animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
          >
            <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center shrink-0">
              <item.icon size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {item.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/20 text-destructive font-bold text-sm hover:bg-destructive/5 transition-colors">
          <LogOut size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
