import { useEffect, useMemo, useState } from "react";
import { Plus, Phone, MapPin, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  category: string;
  title: string;
  body: string;
  name: string;
  phone: string;
  city: string;
  created_at: string;
  expires_at: string;
  user_id: string | null;
}

const categories = [
  { value: "all", label: "Все", emoji: "" },
  { value: "masterclass", label: "Мастер-класс", emoji: "🎉" },
  { value: "job_seek", label: "Ищу работу", emoji: "💼" },
  { value: "specialist", label: "Нужен специалист", emoji: "🔍" },
  { value: "nanny", label: "Ищу няню", emoji: "👶" },
  { value: "opening", label: "Мы открылись", emoji: "🎊" },
  { value: "other", label: "Другое", emoji: "📌" },
];

const cities = [
  "Алматы","Астана","Шымкент","Караганда","Актобе","Тараз","Павлодар",
  "Усть-Каменогорск","Семей","Атырау","Костанай","Кызылорда","Уральск",
  "Петропавловск","Актау","Жанаозен","Темиртау","Туркестан","Кокшетау",
  "Талдыкорган","Экибастуз",
];

const BoardPage = ({ city }: { city: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCat, setActiveCat] = useState("all");
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "other",
    name: "",
    phone: "",
    city: city || "Актау",
  });

  const load = async () => {
    setLoading(true);
    // Anonymous visitors read the public view (no phone numbers); authenticated users read the base table.
    const source = user ? "announcements" : "announcements_public";
    const { data } = await supabase
      .from(source as any)
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);


  const filtered = useMemo(
    () => items.filter((i) =>
      (!city || i.city === city) && (activeCat === "all" || i.category === activeCat)
    ),
    [items, city, activeCat]
  );

  const openCreate = () => {
    if (!user) {
      toast({ title: "Войдите в аккаунт", description: "Чтобы разместить объявление, нужна авторизация", variant: "destructive" });
      return;
    }
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Заполните поля", description: "Заголовок и текст обязательны", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("announcements").insert({
      ...form,
      user_id: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Опубликовано!" });
    setOpen(false);
    setForm({ ...form, title: "", body: "" });
    load();
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <span className="text-xl">📣</span> Доска объявлений
          </h1>
          <p className="text-xs text-muted-foreground font-bold mt-0.5">
            {city || "Актау"} · объявления активны 30 дней
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-black text-xs px-4 py-2.5 rounded-full shadow-md"
        >
          <Plus size={14} /> Добавить
        </button>
      </div>

      {/* Category pills */}
      <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map((c) => {
            const active = activeCat === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setActiveCat(c.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {c.emoji && <span className="mr-1">{c.emoji}</span>}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="cartoon-card flex flex-col items-center justify-center text-center py-14 px-6">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="font-black text-lg">Пока нет объявлений</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              Будьте первым — добавьте объявление!
            </p>
            <button
              onClick={openCreate}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full shadow-md"
            >
              <Plus size={16} /> Добавить объявление
            </button>
          </div>
        )}
        {!loading && filtered.map((a) => {
          const cat = categories.find((c) => c.value === a.category);
          return (
            <div key={a.id} className="cartoon-card p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-yellow-light">
                  {cat?.emoji} {cat?.label || a.category}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} /> {a.city}
                </span>
              </div>
              <h3 className="font-black text-base">{a.title}</h3>
              <p className="text-sm mt-2 whitespace-pre-line font-medium">{a.body}</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{a.name}</span>
                {a.phone && (
                  <a href={`tel:${a.phone}`} className="flex items-center gap-1 text-xs font-black text-primary">
                    <Phone size={12} /> {a.phone}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-black">Новое объявление</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Категория</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold">
                  {categories.filter((c) => c.value !== "all").map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Город</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold">
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Заголовок</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Текст</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} maxLength={2000} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Имя / название</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Телефон</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} placeholder="+7 ..." className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <button onClick={handleCreate} disabled={saving} className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Опубликовать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
