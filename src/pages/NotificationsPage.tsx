import { Bell, Calendar, MapPin, Star, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const notifications = [
  { id: 1, type: "event", title: "Фестиваль «Жулдыз» уже завтра!", desc: "Не забудьте — 15 марта, парк Горького", time: "2 часа назад", read: false },
  { id: 2, type: "promo", title: "Скидка 20% на первое занятие", desc: "Студия рисования «Кисточка» приглашает!", time: "5 часов назад", read: false },
  { id: 3, type: "update", title: "Новый кружок в вашем районе", desc: "Робототехника KidsTech открыл филиал рядом", time: "Вчера", read: false },
  { id: 4, type: "event", title: "Мастер-класс по акварели", desc: "Бесплатное занятие 18 марта", time: "Вчера", read: true },
  { id: 5, type: "update", title: "Обновление расписания", desc: "Танцы «Ритм» изменили время занятий", time: "2 дня назад", read: true },
  { id: 6, type: "promo", title: "Пробный урок плавания бесплатно", desc: "Бассейн «Дельфин» — запишитесь сейчас", time: "3 дня назад", read: true },
];

const typeEmoji: Record<string, string> = {
  event: "🎉",
  promo: "🎁",
  update: "📢",
};

const NotificationsPage = () => {
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
    toast({ title: "Готово", description: "Все уведомления отмечены как прочитанные" });
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Уведомления
          </h1>
          <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} непрочитанных` : "Нет новых"}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-accent text-xs font-bold">
            <Check size={12} />Прочитать все
          </button>
        )}
      </div>

      <div className="px-4 flex flex-col gap-2">
        {items.map((n, i) => (
          <button
            key={n.id}
            onClick={() => {
              setItems(items.map((item) => item.id === n.id ? { ...item, read: true } : item));
              toast({ title: n.title, description: n.desc });
            }}
            className={`flex gap-3 p-3 rounded-xl border text-left transition-all animate-slide-up ${
              n.read ? "bg-card border-border/50" : "bg-yellow-light border-primary/30 shadow-sm"
            }`}
            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
          >
            <span className="text-2xl mt-0.5 shrink-0">{typeEmoji[n.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm leading-snug line-clamp-1 ${n.read ? "font-semibold" : "font-bold"}`}>{n.title}</h3>
                {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
