import { useEffect, useMemo, useState } from "react";
import { Plus, Phone, MapPin, X, Loader2, Pencil, Trash2, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  category: string;
  title: string;
  body: string;
  name: string;
  phone: string;
  city: string;
  image_url?: string | null;
  created_at: string;
  expires_at: string;
  user_id: string | null;
}

const categoriesByLang = {
  kz: [
    { value: "all", label: "Барлығы", emoji: "" },
    { value: "masterclass", label: "Шеберлік сыныбы", emoji: "🎉" },
    { value: "job_seek", label: "Жұмыс іздеймін", emoji: "💼" },
    { value: "specialist", label: "Маман керек", emoji: "🔍" },
    { value: "nanny", label: "Бала күтуші іздеймін", emoji: "👶" },
    { value: "opening", label: "Біз ашылдық", emoji: "🎊" },
    { value: "other", label: "Басқа", emoji: "📌" },
  ],
  ru: [
    { value: "all", label: "Все", emoji: "" },
    { value: "masterclass", label: "Мастер-класс", emoji: "🎉" },
    { value: "job_seek", label: "Ищу работу", emoji: "💼" },
    { value: "specialist", label: "Нужен специалист", emoji: "🔍" },
    { value: "nanny", label: "Ищу няню", emoji: "👶" },
    { value: "opening", label: "Мы открылись", emoji: "🎊" },
    { value: "other", label: "Другое", emoji: "📌" },
  ],
  en: [
    { value: "all", label: "All", emoji: "" },
    { value: "masterclass", label: "Master class", emoji: "🎉" },
    { value: "job_seek", label: "Looking for a job", emoji: "💼" },
    { value: "specialist", label: "Need a specialist", emoji: "🔍" },
    { value: "nanny", label: "Looking for a nanny", emoji: "👶" },
    { value: "opening", label: "We've opened", emoji: "🎊" },
    { value: "other", label: "Other", emoji: "📌" },
  ],
};

const uiStrings = {
  kz: {
    title: "Хабарландыру тақтасы",
    subtitle: "хабарландырулар 30 күн белсенді",
    add: "Қосу",
    empty_title: "Әзірге хабарландырулар жоқ",
    empty_sub: "Бірінші болыңыз — хабарландыру қосыңыз!",
    add_full: "Хабарландыру қосу",
    edit_title: "Хабарландыруды өңдеу",
    new_title: "Жаңа хабарландыру",
    category: "Санат",
    city: "Қала",
    head: "Тақырып",
    body: "Мәтін",
    photo: "Фото (міндетті емес)",
    photo_add: "Фото қосу (кез келген формат)",
    uploading: "Жүктелуде...",
    name: "Аты / атауы",
    phone: "Телефон",
    save: "Сақтау",
    publish: "Жариялау",
    fill_fields: "Өрістерді толтырыңыз",
    fill_desc: "Тақырып пен мәтін міндетті",
    login_req: "Аккаунтқа кіріңіз",
    login_desc: "Хабарландыру орналастыру үшін авторизация қажет",
    too_big: "Файл 10 MB-дан үлкен",
    upload_fail: "Жүктеу мүмкін болмады",
    error: "Қате",
    updated: "Жаңартылды",
    published: "Жарияланды!",
    deleted: "Жойылды",
    confirm_del: "Хабарландыруды жою керек пе?",
    edit_btn: "Өңдеу",
    delete_btn: "Жою",
  },
  ru: {
    title: "Доска объявлений",
    subtitle: "объявления активны 30 дней",
    add: "Добавить",
    empty_title: "Пока нет объявлений",
    empty_sub: "Будьте первым — добавьте объявление!",
    add_full: "Добавить объявление",
    edit_title: "Редактировать объявление",
    new_title: "Новое объявление",
    category: "Категория",
    city: "Город",
    head: "Заголовок",
    body: "Текст",
    photo: "Фото (необязательно)",
    photo_add: "Добавить фото (любой формат)",
    uploading: "Загрузка...",
    name: "Имя / название",
    phone: "Телефон",
    save: "Сохранить",
    publish: "Опубликовать",
    fill_fields: "Заполните поля",
    fill_desc: "Заголовок и текст обязательны",
    login_req: "Войдите в аккаунт",
    login_desc: "Чтобы разместить объявление, нужна авторизация",
    too_big: "Файл больше 10 MB",
    upload_fail: "Не удалось загрузить",
    error: "Ошибка",
    updated: "Обновлено",
    published: "Опубликовано!",
    deleted: "Удалено",
    confirm_del: "Удалить объявление?",
    edit_btn: "Редактировать",
    delete_btn: "Удалить",
  },
  en: {
    title: "Bulletin board",
    subtitle: "posts active for 30 days",
    add: "Add",
    empty_title: "No posts yet",
    empty_sub: "Be the first — add a post!",
    add_full: "Add post",
    edit_title: "Edit post",
    new_title: "New post",
    category: "Category",
    city: "City",
    head: "Title",
    body: "Text",
    photo: "Photo (optional)",
    photo_add: "Add photo (any format)",
    uploading: "Uploading...",
    name: "Name / title",
    phone: "Phone",
    save: "Save",
    publish: "Publish",
    fill_fields: "Fill the fields",
    fill_desc: "Title and text are required",
    login_req: "Sign in",
    login_desc: "Sign in to post",
    too_big: "File larger than 10 MB",
    upload_fail: "Upload failed",
    error: "Error",
    updated: "Updated",
    published: "Published!",
    deleted: "Deleted",
    confirm_del: "Delete the post?",
    edit_btn: "Edit",
    delete_btn: "Delete",
  },
};

const cities = [
  "Алматы","Астана","Шымкент","Караганда","Актобе","Тараз","Павлодар",
  "Усть-Каменогорск","Семей","Атырау","Костанай","Кызылорда","Уральск",
  "Петропавловск","Актау","Жанаозен","Темиртау","Туркестан","Кокшетау",
  "Талдыкорган","Экибастуз",
];

type FormState = {
  title: string;
  body: string;
  category: string;
  name: string;
  phone: string;
  city: string;
  image_url: string;
};

const emptyForm = (city: string): FormState => ({
  title: "",
  body: "",
  category: "other",
  name: "",
  phone: "",
  city: city || "Актау",
  image_url: "",
});

const BoardPage = ({ city }: { city: string }) => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const tt = uiStrings[lang] || uiStrings.kz;
  const categories = categoriesByLang[lang] || categoriesByLang.kz;
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeCat, setActiveCat] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(city));

  const load = async () => {
    setLoading(true);
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
      i.category !== "event" &&
      (!city || i.city === city) && (activeCat === "all" || i.category === activeCat)
    ),
    [items, city, activeCat]
  );

  const openCreate = () => {
    if (!user) {
      toast({ title: tt.login_req, description: tt.login_desc, variant: "destructive" });
      return;
    }
    setEditingId(null);
    setForm(emptyForm(city));
    setOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body,
      category: a.category,
      name: a.name || "",
      phone: a.phone || "",
      city: a.city,
      image_url: a.image_url || "",
    });
    setOpen(true);
  };

  const handleFile = async (file: File) => {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: tt.too_big, variant: "destructive" });
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
      toast({ title: tt.upload_fail, description: error.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("club-media").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: tt.fill_fields, description: tt.fill_desc, variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from("announcements").update({
        title: form.title,
        body: form.body,
        category: form.category,
        name: form.name,
        phone: form.phone,
        city: form.city,
        image_url: form.image_url || null,
      } as any).eq("id", editingId);
      setSaving(false);
      if (error) { toast({ title: tt.error, description: error.message, variant: "destructive" }); return; }
      toast({ title: tt.updated });
    } else {
      const { error } = await supabase.from("announcements").insert({
        ...form,
        image_url: form.image_url || null,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      } as any);
      setSaving(false);
      if (error) { toast({ title: tt.error, description: error.message, variant: "destructive" }); return; }
      toast({ title: tt.published });
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm(city));
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tt.confirm_del)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast({ title: tt.error, description: error.message, variant: "destructive" }); return; }
    toast({ title: tt.deleted });
    load();
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <span className="text-xl">📣</span> {tt.title}
          </h1>
          <p className="text-xs text-muted-foreground font-bold mt-0.5">
            {city || "Актау"} · {tt.subtitle}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-black text-xs px-4 py-2.5 rounded-full shadow-md"
        >
          <Plus size={14} /> {tt.add}
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
            <h3 className="font-black text-lg">{tt.empty_title}</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              {tt.empty_sub}
            </p>
            <button
              onClick={openCreate}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full shadow-md"
            >
              <Plus size={16} /> {tt.add_full}
            </button>
          </div>
        )}
        {!loading && filtered.map((a) => {
          const cat = categories.find((c) => c.value === a.category);
          const isOwner = user && a.user_id === user.id;
          return (
            <div key={a.id} className="cartoon-card p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-yellow-light">
                  {cat?.emoji} {cat?.label || a.category}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} /> {a.city}
                </span>
                {isOwner && (
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-full bg-muted hover:bg-muted/70" title={tt.edit_btn}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20" title={tt.delete_btn}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {a.image_url && (
                <img src={a.image_url} alt={a.title} className="w-full max-h-72 object-cover rounded-xl mb-2" />
              )}
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
              <h2 className="font-black">{editingId ? tt.edit_title : tt.new_title}</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.category}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold">
                  {categories.filter((c) => c.value !== "all").map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.city}</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold">
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.head}</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.body}</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} maxLength={2000} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.photo}</label>
                {form.image_url ? (
                  <div className="mt-1 relative">
                    <img src={form.image_url} alt="" className="w-full max-h-52 object-cover rounded-xl" />
                    <button onClick={() => setForm({ ...form, image_url: "" })} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="mt-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-muted text-sm font-bold cursor-pointer border-2 border-dashed border-border">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                    {uploading ? tt.uploading : tt.photo_add}
                    <input
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                    />
                  </label>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.name}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{tt.phone}</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} placeholder="+7 ..." className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold" />
              </div>
              <button onClick={handleSave} disabled={saving || uploading} className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : (editingId ? tt.save : tt.publish)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
