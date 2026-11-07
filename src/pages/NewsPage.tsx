import SectionLinks from "@/components/sections/SectionLinks";
import { useEffect, useState } from "react";
import { Plus, Loader2, Calendar as CalendarIcon, MapPin, Phone, Pencil, Trash2, ImagePlus, X, ChevronDown, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CityPickerSheet from "@/components/CityPickerSheet";
import { upcomingCityEvents, formatEventDate, eventInput, eventInputToIso, matchesEventFilters, EVENT_KINDS, AGE_FILTERS, type EventFilters, type DateFilter } from "@/lib/events";
import EventClubLink, { type EventClub } from "@/components/events/EventClubLink";
import PhoneActions from "@/components/events/PhoneActions";
import { KIND_LABELS } from "@/components/events/eventLabels";
import { toast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import SEO from "@/components/SEO";
import PublicationSource from "@/components/PublicationSource";

interface EventItem {
  id: string;
  title: string;
  body: string;
  name: string;
  phone?: string;
  city: string;
  event_date: string | null;
  event_end_date?: string | null;
  image_url?: string | null;
  created_at: string;
  user_id: string | null;
  source_label?: string | null;
  source_url?: string | null;
  club_id?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  is_free?: boolean | null;
  price_from?: number | null;
  event_kind?: string | null;
  public_phone?: string | null;
}

const EMPTY_FILTERS: EventFilters = { date: "all", age: null, price: null, kind: null };
const FILTER_UI = {
  ru: { all: "Все", today: "Сегодня", weekend: "Выходные", week: "Эта неделя", free: "Бесплатно", paid: "Платно", nothing: "Ничего не нашлось", reset: "Сбросить фильтры", years: "лет" },
  kz: { all: "Барлығы", today: "Бүгін", weekend: "Демалыс", week: "Осы апта", free: "Тегін", paid: "Ақылы", nothing: "Ештеңе табылмады", reset: "Сүзгілерді тазалау", years: "жас" },
  en: { all: "All", today: "Today", weekend: "Weekend", week: "This week", free: "Free", paid: "Paid", nothing: "Nothing found", reset: "Reset filters", years: "yrs" },
};

type FormState = {
  title: string;
  body: string;
  name: string;
  phone: string;
  event_date: string;
  event_end_date: string;
  image_url: string;
  period: "week" | "month";
};

const emptyForm = (): FormState => ({
  title: "", body: "", name: "", phone: "", event_date: "", event_end_date: "", image_url: "", period: "week",
});

const newsUi = {
  ru: { add: "Добавить событие", add_title: "Добавить событие в городе", empty: "Пока нет событий в {city}", empty_desc: "Будьте первым — расскажите о своём событии!", edit: "Редактировать", del: "Удалить", collapse: "Свернуть", read: "Читать полностью", edit_event: "Редактировать событие", publish_event: "Опубликовать событие в {city}", form_desc: "Расскажите, что и когда будет в городе.", name: "Название события *", name_ph: "Например: Детский фестиваль науки", date: "Дата и время события *", desc: "Описание *", desc_ph: "Где, для кого, цена, программа...", photo: "Фото (необязательно)", remove_photo: "Удалить фото", uploading: "Загрузка...", add_photo: "Добавить фото (любой формат)", organizer: "Имя организатора", organizer_ph: "Центр / контакт", phone: "Телефон", period: "Период публикации", week: "Неделя", month: "Месяц", save: "Сохранить", publish: "Опубликовать", confirm_del: "Удалить событие?", browse: "Смотреть кружки", empty_upcoming: "В городе {city} пока нет предстоящих событий" },
  kz: { add: "Оқиға қосу", add_title: "Қаладағы оқиғаны қосу", empty: "{city} қаласында әзірге оқиғалар жоқ", empty_desc: "Бірінші болып өз оқиғаңыз туралы айтыңыз!", edit: "Өңдеу", del: "Жою", collapse: "Жасыру", read: "Толық оқу", edit_event: "Оқиғаны өңдеу", publish_event: "{city} қаласында оқиға жариялау", form_desc: "Қалада не және қашан болатынын айтыңыз.", name: "Оқиға атауы *", name_ph: "Мысалы: Балалар ғылыми фестивалі", date: "Оқиға күні мен уақыты *", desc: "Сипаттама *", desc_ph: "Қайда, кім үшін, бағасы, бағдарламасы...", photo: "Фото (міндетті емес)", remove_photo: "Фотосуретті жою", uploading: "Жүктелуде...", add_photo: "Фото қосу (кез келген формат)", organizer: "Ұйымдастырушының аты", organizer_ph: "Орталық / байланыс", phone: "Телефон", period: "Жариялау мерзімі", week: "Апта", month: "Ай", save: "Сақтау", publish: "Жариялау", confirm_del: "Оқиғаны жою керек пе?", browse: "Үйірмелерді қарау", empty_upcoming: "{city} қаласында алдағы оқиғалар әзірге жоқ" },
  en: { add: "Add event", add_title: "Add an event in the city", empty: "No events in {city} yet", empty_desc: "Be the first to share your event!", edit: "Edit", del: "Delete", collapse: "Collapse", read: "Read more", edit_event: "Edit event", publish_event: "Publish an event in {city}", form_desc: "Tell people what is happening and when.", name: "Event name *", name_ph: "For example: Children's science festival", date: "Event date and time *", desc: "Description *", desc_ph: "Where, for whom, price, program...", photo: "Photo (optional)", remove_photo: "Remove photo", uploading: "Uploading...", add_photo: "Add photo (any format)", organizer: "Organizer name", organizer_ph: "Center / contact", phone: "Phone", period: "Publication period", week: "Week", month: "Month", save: "Save", publish: "Publish", confirm_del: "Delete event?", browse: "Browse clubs", empty_upcoming: "No upcoming events in {city} yet" },
};

const toLocalInput = eventInput;

const NewsPage = ({ city, setCity }: { city: string; setCity?: (city: string) => void }) => {
  const navigate = useNavigate();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const { t, lang } = useLanguage();
  const ui = newsUi[lang] || newsUi.ru;
  const { user } = useAuth();
  const titleLines = t("news.title").split("\n");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [clubs, setClubs] = useState<Record<string, EventClub>>({});
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const fui = FILTER_UI[lang] || FILTER_UI.ru;
  const visible = events.filter((e) => matchesEventFilters(e, filters));
  const chip = (active: boolean, label: string, onClick: () => void, key: string) => (
    <button key={key} type="button" onClick={onClick} aria-pressed={active}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{label}</button>
  );

  const load = async () => {
    setLoading(true);
    const source = user ? "announcements" : "announcements_public";
    const columns = user
      ? "id,title,body,name,phone,city,event_date,event_end_date,image_url,created_at,user_id,source_label,source_url,club_id,age_min,age_max,is_free,price_from,event_kind,public_phone"
      : "id,title,body,name,city,event_date,event_end_date,image_url,created_at,user_id,source_label,source_url,club_id,age_min,age_max,is_free,price_from,event_kind,public_phone";
    const { data } = await (supabase as any)
      .from(source as any)
      .select(columns as string)
      .eq("category", "event")
      .gt("expires_at", new Date().toISOString())
      .order("event_date", { ascending: true, nullsFirst: false });
    const list = upcomingCityEvents((data as any[]) || [], city);
    setEvents(list);
    const ids = [...new Set(list.map((e) => e.club_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data: cl } = await supabase.from("clubs").select("id,name_ru,name_kz,name_en,avatar_url").in("id", ids);
      setClubs(Object.fromEntries(((cl as EventClub[]) || []).map((c) => [c.id, c])));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, city]);

  const openPostForm = () => {
    if (!user) { setAuthOpen(true); return; }
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (e: EventItem) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      body: e.body,
      name: e.name || "",
      phone: e.phone || "",
      event_date: toLocalInput(e.event_date),
      event_end_date: e.event_end_date || "",
      image_url: e.image_url || "",
      period: "week",
    });
    setOpen(true);
  };

  const handleFile = async (file: File) => {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Файл больше 10 MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `announcements/${user.id}/${Date.now()}.${ext}`;
    const isImage = file.type.startsWith("image/");
    const { error } = await supabase.storage.from("club-media").upload(path, file, {
      contentType: isImage ? file.type : "application/octet-stream",
      upsert: false,
    });
    if (error) {
      setUploading(false);
      toast({ title: "Не удалось загрузить", description: error.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("club-media").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    setUploading(false);
  };

  const submit = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Заполните название и описание", variant: "destructive" });
      return;
    }
    if (!form.event_date) {
      toast({ title: "Укажите дату события", variant: "destructive" });
      return;
    }
    if (form.title.length > 120 || form.body.length > 1500) {
      toast({ title: "Слишком длинный текст", variant: "destructive" });
      return;
    }
    if (form.event_end_date && form.event_end_date < form.event_date.slice(0, 10)) {
      toast({ title: lang === "ru" ? "Дата окончания не может быть раньше начала" : lang === "kz" ? "Аяқталу күні басталу күнінен бұрын болмауы керек" : "End date cannot precede start date", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    if (editingId) {
      const { error } = await supabase.from("announcements").update({
        title: form.title.trim(),
        body: form.body.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        event_date: eventInputToIso(form.event_date),
        event_end_date: form.event_end_date || null,
        image_url: form.image_url || null,
      } as any).eq("id", editingId);
      setSubmitting(false);
      if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Обновлено" });
    } else {
      const days = form.period === "week" ? 7 : 30;
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("announcements").insert({
        user_id: user.id,
        category: "event",
        title: form.title.trim(),
        body: form.body.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        city,
        event_date: eventInputToIso(form.event_date),
        event_end_date: form.event_end_date || null,
        image_url: form.image_url || null,
        expires_at: expires,
      } as any);
      setSubmitting(false);
      if (error) { toast({ title: "Не удалось опубликовать", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Опубликовано!", description: "Событие появится в ленте города." });
    }
    setEditingId(null);
    setForm(emptyForm());
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(ui.confirm_del)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Удалено" });
    load();
  };


  return (
    <div className="pb-24 max-w-6xl mx-auto">
      {setCity && (
        <CityPickerSheet open={showCityPicker} city={city} onClose={() => setShowCityPicker(false)} onSelect={setCity} />
      )}
      <SEO
        title={(lang === "kz" ? `${city} балалар афишасы | BalaHub` : lang === "en" ? `Kids events in ${city} | BalaHub` : `Детская афиша ${city} | BalaHub`).slice(0, 60)}
        description={`Афиша детских событий, мастер-классов и праздников в городе ${city}. Актуальные даты, описание и контакты организаторов.`.slice(0, 159)}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Детская афиша ${city}`,
          itemListElement: events
            .filter((e) => e.event_date)
            .slice(0, 20)
            .map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Event",
                name: e.title,
                startDate: e.event_date,
                description: (e.body || "").slice(0, 300),
                eventStatus: "https://schema.org/EventScheduled",
                location: { "@type": "Place", name: e.city, address: e.city },
                organizer: { "@type": "Organization", name: e.name || "BalaHub" },
                ...(e.image_url ? { image: e.image_url } : {}),
              },
            })),
        }}
      />
      {/* Header banner */}
      <div className="relative h-44 rounded-b-3xl overflow-hidden" style={{ background: "var(--gradient-header)" }}>
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrandLogo size="xs" />
              {setCity ? (
                <button
                  onClick={() => setShowCityPicker(true)}
                  aria-label={t("home.select_city")}
                  className="flex items-center gap-1 text-primary-foreground text-xs font-black px-2.5 py-1 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30"
                >
                  <MapPin size={12} />{city}<ChevronDown size={14} />
                </button>
              ) : (
                <span className="text-primary-foreground/80 text-xs font-bold">{t("news.today_in")} {city}</span>
              )}
            </div>
            <h1 className="text-xl font-black text-primary-foreground leading-snug">
              {titleLines.map((line, i) => (
                <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
              ))}
            </h1>
          </div>
          <button
            onClick={openPostForm}
            aria-label={ui.add}
            title={ui.add_title}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} className="text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="mt-4"><SectionLinks /></div>

      {/* Filters */}
      {!loading && events.length > 0 && (
        <div className="mt-4 space-y-2">
          {[
            (["all", "today", "weekend", "week"] as DateFilter[]).map((d) => chip(filters.date === d, fui[d], () => setFilters({ ...filters, date: d }), d)),
            AGE_FILTERS.map((a) => chip(filters.age === a, a === "12+" ? `12+ ${fui.years}` : `${a.replace("-", "–")} ${fui.years}`, () => setFilters({ ...filters, age: filters.age === a ? null : a }), a)),
            (["free", "paid"] as const).map((p) => chip(filters.price === p, fui[p], () => setFilters({ ...filters, price: filters.price === p ? null : p }), p)),
            EVENT_KINDS.map((k) => chip(filters.kind === k, KIND_LABELS[k][lang] || KIND_LABELS[k].ru, () => setFilters({ ...filters, kind: filters.kind === k ? null : k }), k)),
          ].map((row, i) => (
            <div key={i} className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">{row}</div>
          ))}
        </div>
      )}

      {/* Events list */}
      <div className="px-4 mt-5">
        {loading && (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        )}
        {!loading && events.length === 0 && (
          <div className="cartoon-card flex flex-col items-center justify-center text-center py-14 px-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-black text-lg">{ui.empty_upcoming.replace("{city}", city)}</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              {ui.empty_desc}
            </p>
            <button
              onClick={openPostForm}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full shadow-md"
            >
              <Plus size={16} /> {ui.add}
            </button>
            <button
              onClick={() => navigate("/clubs")}
              className="mt-3 flex items-center gap-2 bg-muted text-foreground font-black text-sm px-6 py-3 rounded-full border-2 border-border"
            >
              <Search size={16} /> {ui.browse}
            </button>
          </div>
        )}
        {!loading && events.length > 0 && visible.length === 0 && (
          <div className="cartoon-card flex flex-col items-center text-center py-12 px-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-black text-lg">{fui.nothing}</h3>
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="mt-4 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full">{fui.reset}</button>
          </div>
        )}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((e, i) => {
              const isOwner = user && e.user_id === user.id;
              return (
                <div
                  key={e.id}
                  className="cartoon-card overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                >
                  {e.image_url && (
                    <img src={e.image_url} alt={e.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      {e.event_date && (
                        <div className="flex items-center gap-1.5 text-xs font-black text-primary mb-2">
                          <CalendarIcon size={14} /> {formatEventDate(e.event_date, e.event_end_date, lang)}
                        </div>
                      )}
                      {isOwner && (
                        <div className="flex items-center gap-1 -mt-1">
                          <button onClick={() => openEdit(e)} aria-label={ui.edit} className="p-1.5 rounded-full bg-muted hover:bg-muted/70" title={ui.edit}>
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(e.id)} aria-label={ui.del} className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20" title={ui.del}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-black text-base leading-snug"><Link to={`/publication/${e.id}`} className="hover:underline">{e.title}</Link></h3>
                    <p className={`text-sm mt-2 whitespace-pre-line font-medium ${expanded[e.id] ? "" : "line-clamp-4"}`}>{e.body}</p>
                    {e.body && e.body.length > 180 && (
                      <button
                        onClick={() => setExpanded((s) => ({ ...s, [e.id]: !s[e.id] }))}
                        className="mt-1 text-xs font-black text-primary hover:underline"
                      >
                        {expanded[e.id] ? ui.collapse : ui.read}
                      </button>
                    )}
                    <PublicationSource label={e.source_label} url={e.source_url} />
                    {e.club_id && <EventClubLink club={clubs[e.club_id]} />}
                    {e.public_phone && <PhoneActions phone={e.public_phone} />}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <MapPin size={11} /> {e.city}
                      </span>
                      {e.phone && !e.public_phone && (
                        <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-xs font-black text-primary">
                          <Phone size={12} /> {e.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? ui.edit_event : ui.publish_event.replace("{city}", city)}</DialogTitle>
            <DialogDescription>
              {ui.form_desc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{ui.name}</Label>
              <Input
                value={form.title}
                maxLength={120}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={ui.name_ph}
              />
            </div>
            <div>
              <Label>{lang === "ru" ? "Дата события *" : lang === "kz" ? "Оқиға күні *" : "Event date *"}</Label>
              <Input
                type="date"
                value={form.event_date.slice(0, 10)}
                onChange={(e) => setForm({ ...form, event_date: e.target.value + (form.event_date.includes("T") ? "T" + form.event_date.split("T")[1] : "") })}
              />
              <Label>{lang === "ru" ? "Время (необязательно, Актау UTC+5)" : lang === "kz" ? "Уақыт (міндетті емес, Ақтау UTC+5)" : "Time (optional, Aktau UTC+5)"}</Label>
              <Input type="time" disabled={!form.event_date} value={form.event_date.split("T")[1] || ""} onChange={(e) => setForm({ ...form, event_date: form.event_date.slice(0, 10) + (e.target.value ? "T" + e.target.value : "") })} />
              <Label>{lang === "ru" ? "Дата окончания (необязательно)" : lang === "kz" ? "Аяқталу күні (міндетті емес)" : "End date (optional)"}</Label>
              <Input type="date" min={form.event_date.slice(0, 10)} value={form.event_end_date} onChange={(e) => setForm({ ...form, event_end_date: e.target.value })} />
            </div>
            <div>
              <Label>{ui.desc}</Label>
              <Textarea
                value={form.body}
                maxLength={1500}
                rows={4}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={ui.desc_ph}
              />
            </div>
            <div>
              <Label>{ui.photo}</Label>
              {form.image_url ? (
                <div className="mt-1 relative">
                  <img src={form.image_url} alt="" className="w-full max-h-52 object-cover rounded-xl" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: "" })} aria-label={ui.remove_photo} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-muted text-sm font-bold cursor-pointer border-2 border-dashed border-border">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  {uploading ? ui.uploading : ui.add_photo}
                  <input
                    type="file"
                    accept="*/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                  />
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{ui.organizer}</Label>
                <Input
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={ui.organizer_ph}
                />
              </div>
              <div>
                <Label>{ui.phone}</Label>
                <Input
                  value={form.phone}
                  maxLength={30}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7..."
                />
              </div>
            </div>
            {!editingId && (
              <div>
                <Label>{ui.period}</Label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, period: "week" })}
                    className={`flex-1 py-2 rounded-md border-2 font-bold text-sm ${form.period === "week" ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
                  >
                    {ui.week}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, period: "month" })}
                    className={`flex-1 py-2 rounded-md border-2 font-bold text-sm ${form.period === "month" ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
                  >
                    {ui.month}
                  </button>
                </div>
              </div>
            )}
            <Button onClick={submit} disabled={submitting || uploading} className="w-full">
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {editingId ? ui.save : ui.publish}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;
