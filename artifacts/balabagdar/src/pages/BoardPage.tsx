import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Phone, Clock, ChevronDown, X, Send, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  category: string;
  title: string;
  body: string;
  name: string;
  phone?: string | null;
  city: string;
  createdAt: string;
}

const CATEGORIES: { value: string; label: string; emoji: string; color: string }[] = [
  { value: "all",       label: "Все",              emoji: "📋", color: "bg-foreground/8 text-foreground" },
  { value: "event",     label: "Мастер-класс",     emoji: "🎉", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "job_seek",  label: "Ищу работу",       emoji: "💼", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "job_offer", label: "Нужен специалист", emoji: "🔍", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "nanny",     label: "Ищу няню",         emoji: "👶", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "opening",   label: "Мы открылись",     emoji: "🚀", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "other",     label: "Другое",           emoji: "📌", color: "bg-slate-50 text-slate-700 border-slate-200" },
];

function catInfo(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

interface BoardPageProps { city?: string; }

const CITIES = ["Актау", "Алматы", "Астана", "Шымкент", "Атырау", "Актобе", "Уральск"];

const BoardPage = ({ city = "Актау" }: BoardPageProps) => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    category: "event",
    title: "",
    body: "",
    name: "",
    phone: "",
    city: city || "Актау",
  });

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (activeFilter !== "all") params.category = activeFilter;
    api.announcements.list(params)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [city, activeFilter]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim() || !form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.announcements.create({
        ...form,
        city: form.city || city || "Актау",
      });
      setSuccess(true);
      setShowForm(false);
      setForm({ category: "event", title: "", body: "", name: "", phone: "", city: city || "Актау" });
      setTimeout(() => { setSuccess(false); load(); }, 300);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = activeFilter === "all" ? items : items.filter((i) => i.category === activeFilter);

  return (
    <div className="pb-28 max-w-6xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Megaphone size={20} className="text-primary" /> Доска объявлений
          </h1>
          <p className="text-xs text-muted-foreground font-bold mt-0.5">{city} · объявления активны 30 дней</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSuccess(false); }}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-all"
        >
          <Plus size={15} /> Добавить
        </button>
      </div>

      {/* Category filters */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap border transition-all ${
              activeFilter === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-foreground/10 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Success banner */}
      {success && (
        <div className="mx-4 mb-3 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-black text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-slide-up">
          ✅ Объявление опубликовано!
        </div>
      )}

      {/* List */}
      <div className="px-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 cartoon-card">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-black text-sm">Пока нет объявлений</p>
            <p className="text-xs text-muted-foreground mt-1">Будьте первым — добавьте объявление!</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-primary text-primary-foreground font-black text-xs px-5 py-2.5 rounded-2xl"
            >
              + Добавить объявление
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const cat = catInfo(item.category);
            return (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-4 border-[2.5px] border-foreground/8"
                style={{ boxShadow: "var(--shadow-cartoon)" }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${cat.color}`}>
                    {cat.emoji} {cat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-0.5 shrink-0">
                    <Clock size={9} /> {timeAgo(item.createdAt)}
                  </span>
                </div>
                <h3 className="font-black text-sm leading-snug mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-3">{item.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-foreground/70">{item.name}</span>
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary font-black text-xs px-3 py-1.5 rounded-xl"
                    >
                      <Phone size={11} /> {item.phone}
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-background w-full max-w-lg rounded-t-3xl px-5 pt-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base">Новое объявление</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* Category picker */}
            <div className="mb-4">
              <label className="text-xs font-black text-muted-foreground mb-2 block">Тип объявления</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black border-2 text-left transition-all ${
                      form.category === cat.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-foreground/8 bg-card text-foreground"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-3">
              <label className="text-xs font-black text-muted-foreground mb-1.5 block">Город</label>
              <div className="relative">
                <select
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full border-2 border-foreground/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-card appearance-none pr-8"
                >
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-xs font-black text-muted-foreground mb-1.5 block">Заголовок *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Например: Набор в группу логопеда"
                maxLength={120}
                className="w-full border-2 border-foreground/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-card placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Body */}
            <div className="mb-3">
              <label className="text-xs font-black text-muted-foreground mb-1.5 block">Текст объявления *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Опишите подробнее — возраст детей, расписание, цена..."
                rows={3}
                maxLength={500}
                className="w-full border-2 border-foreground/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-card placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="text-xs font-black text-muted-foreground mb-1.5 block">Ваше имя *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Имя или название центра"
                maxLength={80}
                className="w-full border-2 border-foreground/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-card placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className="text-xs font-black text-muted-foreground mb-1.5 block">Телефон для связи</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+7 777 123 45 67"
                type="tel"
                className="w-full border-2 border-foreground/10 rounded-xl px-3 py-2.5 text-sm font-bold bg-card placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.body.trim() || !form.name.trim()}
              className="w-full bg-primary text-primary-foreground font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              <Send size={16} />
              {submitting ? "Публикую..." : "Опубликовать бесплатно"}
            </button>
            <p className="text-center text-[10px] text-muted-foreground mt-2 font-bold">
              Объявление будет активно 30 дней
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
