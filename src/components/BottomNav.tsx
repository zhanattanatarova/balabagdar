import { Home, Search, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Главная", color: "text-orange-warm" },
  { path: "/map", icon: Search, label: "Поиск", color: "text-green-fresh" },
  { path: "/news", icon: Bell, label: "Новости", color: "text-accent" },
  { path: "/profile", icon: User, label: "Профиль", color: "text-primary" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label, color }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-4 py-2 active:scale-90 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-primary" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-primary-foreground" : color} />
              </div>
              <span className={`text-[10px] font-bold ${active ? "text-foreground" : color}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
