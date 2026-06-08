import { Star, ChevronRight, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import newsArt from "@/assets/news-art.jpg";
import newsFestival from "@/assets/news-festival.jpg";
import newsShow from "@/assets/news-show.jpg";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/i18n/translations";

const events: { titleKey: TranslationKey; dateKey: TranslationKey; rating: number; img: string }[] = [
  { titleKey: "news.event1_title", dateKey: "news.date1", rating: 4.8, img: newsArt },
  { titleKey: "news.event2_title", dateKey: "news.date2", rating: 4.7, img: newsFestival },
  { titleKey: "news.event3_title", dateKey: "news.date3", rating: 4.5, img: newsShow },
];

const NewsPage = ({ city }: { city: string }) => {
  const { t } = useLanguage();
  const titleLines = t("news.title").split("\n");

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      {/* Header banner */}
      <div className="relative h-44 rounded-b-3xl overflow-hidden" style={{ background: "var(--gradient-header)" }}>
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrandLogo size="xs" />
              <span className="text-primary-foreground/80 text-xs font-bold">{t("news.today_in")} {city}</span>
            </div>
            <h1 className="text-xl font-black text-primary-foreground leading-snug">
              {titleLines.map((line, i) => (
                <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
              ))}
            </h1>
          </div>
          <button className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Settings size={18} className="text-primary-foreground" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30" style={{
          background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 60\"><path d=\"M0 40 Q50 10 100 35 Q150 60 200 30 Q250 5 300 35 Q350 55 400 25 L400 60 L0 60Z\" fill=\"white\"/></svg>') no-repeat bottom",
          backgroundSize: "cover"
        }} />
      </div>

      {/* Events list */}
      <div className="px-4 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => {
          const title = t(event.titleKey);
          const date = t(event.dateKey);
          return (
            <div
              key={event.titleKey}
              onClick={() => toast({ title, description: `${date} · ⭐ ${event.rating}` })}
              className="cartoon-card overflow-hidden cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
            >
              <div className="relative h-40">
                <img src={event.img} alt={title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5">
                <h3 className="font-black text-sm leading-snug">{title}</h3>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} className={s <= Math.floor(event.rating) ? "text-secondary fill-secondary" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground font-bold">{date}</span>
                  <button className="bg-primary text-primary-foreground text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1">
                    {t("news.more")} <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsPage;
