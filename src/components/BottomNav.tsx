import { Home, Map, Newspaper, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Главная" },
  { path: "/map", icon: Map, label: "Карта" },
  { path: "/news", icon: Newspaper, label: "Новости" },
  { path: "/profile", icon: User, label: "Профиль" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50">
      <div className="flex justify-around items-end h-[72px] max-w-lg mx-auto px-4 pb-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 relative pt-2 pb-1 px-4 transition-all duration-300"
            >
              {active && (
                <span className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary" />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                active ? "bg-primary/10" : ""
              }`}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-colors duration-300 ${active ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <span className={`text-[10px] font-bold transition-colors duration-300 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
