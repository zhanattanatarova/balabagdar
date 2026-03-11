import { Pin, Calendar, ChevronRight, Heart } from "lucide-react";
import eventFestival from "@/assets/event-festival.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import clubDance from "@/assets/club-dance.jpg";
import clubSwim from "@/assets/club-swim.jpg";
import clubSoccer from "@/assets/club-soccer.jpg";

const pinnedEvent = {
  title: "Фестиваль детского творчества «Жулдыз»",
  date: "15 марта 2026",
  desc: "Большой городской фестиваль для детей 3–14 лет. Мастер-классы, конкурсы, концерт!",
  img: eventFestival,
};

const events = [
  { title: "Мастер-класс по акварели", date: "18 марта", desc: "Бесплатный мастер-класс для детей 6–12 лет.", img: eventWorkshop },
  { title: "Открытый урок балета", date: "22 марта", desc: "Пробное занятие для девочек 4–8 лет.", img: clubDance },
  { title: "День открытых дверей — бассейн", date: "25 марта", desc: "Пробное занятие бесплатно.", img: clubSwim },
  { title: "Турнир по мини-футболу", date: "28 марта", desc: "Городской турнир для команд 7–12 лет.", img: clubSoccer },
];

const NewsPage = () => {
  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-lg font-black">Новости</h1>
        <p className="text-xs text-muted-foreground">Мероприятия для детей</p>
      </div>

      {/* Pinned */}
      <div className="mx-4 mt-3 card-photo h-48 cursor-pointer group animate-fade-in">
        <img src={pinnedEvent.img} alt={pinnedEvent.title} className="group-hover:scale-105 transition-transform duration-500" />
        <div className="card-photo-overlay" />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full">
          <Pin size={10} />Закреплено
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1 text-primary-foreground/60 text-[10px] mb-1">
            <Calendar size={10} />{pinnedEvent.date}
          </div>
          <h3 className="text-primary-foreground font-bold text-sm leading-snug">{pinnedEvent.title}</h3>
          <p className="text-primary-foreground/70 text-xs mt-1 line-clamp-2">{pinnedEvent.desc}</p>
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="section-title mb-3">Ближайшие события</h2>
        <div className="flex flex-col gap-2.5">
          {events.map((event, i) => (
            <div
              key={event.title}
              className="flex gap-3 bg-card rounded-xl p-2.5 border border-border/50 shadow-sm cursor-pointer animate-slide-up group"
              style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                <img src={event.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h3 className="font-bold text-xs leading-snug line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Calendar size={10} />{event.date}
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
