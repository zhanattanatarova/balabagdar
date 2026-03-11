import { Pin, Calendar, ChevronRight } from "lucide-react";

const pinnedNews = {
  title: "🎪 Фестиваль детского творчества «Жулдыз»",
  date: "15 марта 2026",
  desc: "Большой городской фестиваль для детей 3–14 лет. Мастер-классы, конкурсы, концерт!",
  pinned: true,
};

const news = [
  {
    emoji: "🎨",
    title: "Мастер-класс по акварели",
    date: "18 марта",
    desc: "Бесплатный мастер-класс для детей 6–12 лет в парке Горького.",
  },
  {
    emoji: "🤖",
    title: "Олимпиада по робототехнике",
    date: "22 марта",
    desc: "Городская олимпиада для юных инженеров. Регистрация открыта!",
  },
  {
    emoji: "🏊",
    title: "День открытых дверей — бассейн «Дельфин»",
    date: "25 марта",
    desc: "Пробное занятие бесплатно для новых учеников.",
  },
  {
    emoji: "📖",
    title: "Литературный вечер для малышей",
    date: "28 марта",
    desc: "Чтение сказок, игры и творческие задания в библиотеке.",
  },
  {
    emoji: "🎭",
    title: "Детский спектакль «Колобок»",
    date: "30 марта",
    desc: "Интерактивный спектакль для детей 3–7 лет в ТРЦ Mega.",
  },
];

const NewsPage = () => {
  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-extrabold">📰 Новости города</h1>
        <p className="text-sm text-muted-foreground">Мероприятия и события для детей</p>
      </div>

      {/* Pinned */}
      <div className="mx-4 mt-3 bg-secondary/20 border-2 border-secondary rounded-2xl p-4 animate-fade-in">
        <div className="flex items-center gap-1.5 mb-2">
          <Pin size={14} className="text-accent" />
          <span className="text-xs font-bold text-accent">Закреплено</span>
        </div>
        <h3 className="font-extrabold text-base">{pinnedNews.title}</h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          {pinnedNews.date}
        </div>
        <p className="text-sm text-foreground/80 mt-2">{pinnedNews.desc}</p>
        <button className="mt-3 bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-bright transition-colors">
          Подробнее
        </button>
      </div>

      {/* News feed */}
      <div className="px-4 mt-5">
        <h2 className="text-base font-extrabold mb-3">Ближайшие события</h2>
        <div className="flex flex-col gap-3">
          {news.map((item, i) => (
            <div
              key={item.title}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s`, animationFillMode: "both" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{item.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar size={11} />
                    {item.date}
                  </div>
                  <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground mt-1 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
