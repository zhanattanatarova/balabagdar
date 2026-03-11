import { Heart, Clock, Bell, Crown, ChevronRight, Settings, LogOut } from "lucide-react";

const menuItems = [
  { icon: Crown, label: "Подписка", desc: "Бесплатный план", color: "bg-secondary/20 text-secondary-foreground" },
  { icon: Heart, label: "Избранные кружки", desc: "3 кружка", color: "bg-peach text-accent" },
  { icon: Clock, label: "История просмотров", desc: "12 просмотров", color: "bg-green-light text-primary" },
  { icon: Bell, label: "Уведомления", desc: "2 новых", color: "bg-primary/10 text-primary" },
  { icon: Settings, label: "Настройки", desc: "", color: "bg-muted text-muted-foreground" },
];

const ProfilePage = () => {
  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-primary rounded-b-2xl px-4 pt-8 pb-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center text-4xl mb-3">
          👩‍👧
        </div>
        <h1 className="text-xl font-extrabold text-primary-foreground">Айгерим</h1>
        <p className="text-primary-foreground/70 text-sm font-semibold">Алматы · 2 ребёнка</p>
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 flex flex-col gap-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow text-left animate-slide-up"
            style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{item.label}</p>
              {item.desc && (
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              )}
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/5 transition-colors">
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
