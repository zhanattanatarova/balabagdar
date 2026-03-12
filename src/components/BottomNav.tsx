import { Home, Search, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Главная", color: "text-orange-warm", activeBg: "bg-orange-warm" },
  { path: "/map", icon: Search, label: "Поиск", color: "text-green-fresh", activeBg: "bg-green-fresh" },
  { path: "/news", icon: Bell, label: "Новости", color: "text-accent", activeBg: "bg-accent" },
  { path: "/profile", icon: User, label: "Профиль", color: "text-primary", activeBg: "bg-primary" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t-[3px] border-foreground/8" style={{ boxShadow: "0 -4px 20px hsl(0 0% 0% / 0.08)" }}>
      <div className="flex justify-around items-center h-[68px] max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label, color, activeBg }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-4 py-2 active:scale-90 transition-transform"
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${active ? `${activeBg} scale-110` : ""}`}
                style={active ? { boxShadow: "var(--shadow-cartoon)" } : {}}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-card" : color} />
              </div>
              <span className={`text-[10px] font-black ${active ? "text-foreground" : color}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
