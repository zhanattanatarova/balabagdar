import { Link } from "react-router-dom";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import { upcomingCityEvents, formatEventDate, aktauDate, type EventKind } from "@/lib/events";
import { KIND_LABELS } from "@/components/events/eventLabels";
import { useLanguage } from "@/hooks/useLanguage";
import { useCityData, resolvedCollections } from "@/hooks/useCityData";
import { pick } from "@/lib/publicData";
import { safeImageUrl } from "@/lib/safeUrl";

const WEEKDAYS: Record<string, string[]> = {
  ru: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
  kz: ["жс", "дс", "сс", "ср", "бс", "жм", "сн"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const UI = {
  ru: { title: "Афиша недели", all: "Вся афиша", more: "Подробнее", free: "Бесплатно", from: "от", empty: "Ближайших событий пока нет — загляните в афишу.", helpTitle: "Не знаете, что выбрать?", helpText: "Посмотрите готовые подборки центров и событий по возрасту и интересам ребёнка.", helpCta: "Подобрать занятие", picks: "Подборки", holidays: "Каникулы", deals: "Акции и пробные занятия" },
  kz: { title: "Аптаның афишасы", all: "Барлық афиша", more: "Толығырақ", free: "Тегін", from: "бастап", empty: "Алдағы оқиғалар әзірге жоқ — афишаны қараңыз.", helpTitle: "Не таңдарыңызды білмейсіз бе?", helpText: "Баланың жасы мен қызығушылығына сай дайын топтамаларды қараңыз.", helpCta: "Сабақ таңдау", picks: "Топтамалар", holidays: "Демалыс", deals: "Акциялар мен сынақ сабақтар" },
  en: { title: "This week’s events", all: "All events", more: "Details", free: "Free", from: "from", empty: "No upcoming events yet — check the full calendar.", helpTitle: "Not sure what to choose?", helpText: "Browse ready-made collections of centers and events by age and interests.", helpCta: "Find an activity", picks: "Collections", holidays: "Holidays", deals: "Deals and trial classes" },
};

export default function CatalogEvents({ city }: { city: string }) {
  const { lang } = useLanguage();
  const ui = UI[lang];
  const { loading, clubs, pubs, collections } = useCityData(true);
  const events = upcomingCityEvents(pubs.filter(p => p.category === "event"), city).slice(0, 3);
  const picks = resolvedCollections(collections, clubs, pubs).slice(0, 4);
  const pickLinks = picks.length
    ? picks.map(({ c }) => ({ to: `/collections/${c.slug}`, label: pick(c, "title", lang) }))
    : [{ to: "/collections", label: ui.picks }, { to: "/holidays", label: ui.holidays }, { to: "/deals", label: ui.deals }];

  return (
    <section className="catalog-events">
      <div className="section-head">
        <h2 className="section-title">{ui.title}</h2>
        <Link to="/" className="section-link">{ui.all}<ArrowRight size={16} /></Link>
      </div>
      <div className="week-grid">
        <div className="space-y-3">
          {loading ? null : events.length === 0 ? (
            <p className="event-empty">{ui.empty}</p>
          ) : events.map(e => {
            const day = e.event_date ? aktauDate(e.event_date) : null;
            const dd = day ? Number(day.split("-")[2]) : null;
            const weekday = day ? (WEEKDAYS[lang] || WEEKDAYS.ru)[new Date(`${day}T12:00:00Z`).getUTCDay()] : "";
            const image = safeImageUrl(e.image_url);
            const kind = (e.event_kind || "other") as EventKind;
            const price = e.is_free ? ui.free : (e.price_from ?? 0) > 0 ? `${ui.from} ${(e.price_from as number).toLocaleString("ru-RU")} ₸` : null;
            return (
              <Link key={e.id} to={`/publication/${e.id}`} className="event-row">
                <span className="event-date" aria-hidden="true"><small>{weekday}</small><strong>{dd ?? "—"}</strong></span>
                <span className="event-body">
                  {(kind !== "other" || price) && (
                    <span className="event-meta">
                      {kind !== "other" && KIND_LABELS[kind] && <span className="event-kind">{KIND_LABELS[kind][lang]}</span>}
                      {price && <span className="event-price">{price}</span>}
                    </span>
                  )}
                  <h3>{e.title}</h3>
                  <span className="event-when">{formatEventDate(e.event_date, e.event_end_date, lang)}{e.name ? ` · ${e.name}` : ""}</span>
                </span>
                {image && <img src={image} alt="" loading="lazy" className="event-photo" />}
                <span className="event-more">{ui.more}</span>
              </Link>
            );
          })}
        </div>
        <aside className="week-aside">
          <div className="help-card">
            <span className="help-icon"><MessageCircleQuestion size={18} /></span>
            <h3>{ui.helpTitle}</h3>
            <p>{ui.helpText}</p>
            <Link to="/collections">{ui.helpCta}</Link>
          </div>
          <nav className="picks-card" aria-label={ui.picks}>
            <h3>{ui.picks}</h3>
            {pickLinks.map(p => <Link key={p.to} to={p.to}>{p.label}<ArrowRight size={15} /></Link>)}
          </nav>
        </aside>
      </div>
    </section>
  );
}
