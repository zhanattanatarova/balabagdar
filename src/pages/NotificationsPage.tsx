import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

const notifications = [
  { id: 1, type: "event", title: "notifications.event_1_title", desc: "notifications.event_1_desc", hours: 2, read: false },
  { id: 2, type: "promo", title: "notifications.promo_title", desc: "notifications.promo_desc", hours: 5, read: false },
  { id: 3, type: "update", title: "notifications.new_club_title", desc: "notifications.new_club_desc", hours: null, read: false },
];

const typeEmoji: Record<string, string> = {
  event: "🎉",
  promo: "🎁",
  update: "📢",
};

const NotificationsPage = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
    toast({ title: t("notifications.done"), description: t("notifications.done_desc") });
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            {t("profile.notifications")}
          </h1>
          <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} ${t("notifications.unread")}` : t("notifications.none")}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-accent text-xs font-bold">
            <Check size={12} />{t("notifications.read_all")}
          </button>
        )}
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((n, i) => (
          <button
            key={n.id}
            onClick={() => {
              setItems(items.map((item) => item.id === n.id ? { ...item, read: true } : item));
               toast({ title: t(n.title as any), description: t(n.desc as any) });
            }}
            className={`flex gap-3 p-3 rounded-xl border text-left transition-all animate-slide-up ${
              n.read ? "bg-card border-border/50" : "bg-yellow-light border-primary/30 shadow-sm"
            }`}
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
          >
            <span className="text-2xl mt-0.5 shrink-0">{typeEmoji[n.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm leading-snug line-clamp-1 ${n.read ? "font-semibold" : "font-bold"}`}>{t(n.title as any)}</h3>
                {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t(n.desc as any)}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{n.hours ? t("notifications.hours_ago").replace("{count}", String(n.hours)) : t("notifications.yesterday")}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
