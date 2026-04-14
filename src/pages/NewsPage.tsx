import { Star, ChevronRight, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import newsArt from "@/assets/news-art.jpg";
import newsFestival from "@/assets/news-festival.jpg";
import newsShow from "@/assets/news-show.jpg";
import logo from "@/assets/balabagdar-logo.jpg";

const events = [
  { title: 'Мастер-класс "Юный Художник"', date: "19 Арана", rating: 4.8, img: newsArt },
  { title: "Детский Фестиваль", date: "16 Арана", rating: 4.7, img: newsFestival },
  { title: 'Шоу "Волшебный мир"', date: "19 Арана", rating: 4.5, img: newsShow },
];

const NewsPage = ({ city }: { city: string }) => (
  <div className="pb-24 max-w-6xl mx-auto">
    {/* Header banner */}
    <div className="relative h-44 rounded-b-3xl overflow-hidden" style={{ background: "var(--gradient-header)" }}>
      <div className="absolute inset-0 flex items-center justify-between px-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src={logo} alt="" className="w-6 h-6" />
            <span className="text-primary-foreground/80 text-xs font-bold">Сегодня в {city}</span>
          </div>
          <h1 className="text-xl font-black text-primary-foreground leading-snug">Новости<br />города</h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Settings size={18} className="text-primary-foreground" />
        </button>
      </div>
      {/* Decorative illustrated bg elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30" style={{
        background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 60\"><path d=\"M0 40 Q50 10 100 35 Q150 60 200 30 Q250 5 300 35 Q350 55 400 25 L400 60 L0 60Z\" fill=\"white\"/></svg>') no-repeat bottom",
        backgroundSize: "cover"
      }} />
    </div>

    {/* Events list */}
    <div className="px-4 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event, i) => (
        <div
          key={event.title}
          onClick={() => toast({ title: event.title, description: `${event.date} · ⭐ ${event.rating}` })}
          className="cartoon-card overflow-hidden cursor-pointer animate-slide-up"
          style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
        >
          <div className="relative h-40">
            <img src={event.img} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-3.5">
            <h3 className="font-black text-sm leading-snug">{event.title}</h3>
            <div className="flex items-center gap-1 mt-1.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={13} className={s <= Math.floor(event.rating) ? "text-secondary fill-secondary" : "text-muted-foreground/30"} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground font-bold">{event.date}</span>
              <button className="bg-primary text-primary-foreground text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1">
                Подробнее <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default NewsPage;
