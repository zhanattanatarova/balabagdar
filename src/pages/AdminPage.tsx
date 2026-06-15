import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Plus, ArrowLeft, ChevronDown, Upload, X, ImagePlus } from "lucide-react";
import { TAXONOMY } from "@/lib/categoriesTaxonomy";
import { validateImageFile } from "@/lib/uploadValidation";

type Credential = { name: string; email: string; password: string; city: string };

const CITIES = [
  "Алматы", "Астана", "Шымкент",
  "Актау", "Актобе", "Аркалык", "Атырау", "Балхаш", "Жанаозен", "Жезказган",
  "Караганда", "Кокшетау", "Костанай", "Кызылорда", "Павлодар",
  "Петропавловск", "Риддер", "Рудный", "Сатпаев", "Семей",
  "Талдыкорган", "Тараз", "Темиртау", "Туркестан", "Уральск",
  "Усть-Каменогорск", "Экибастуз", "Жетысай", "Капшагай", "Каскелен",
  "Кентау", "Лисаковск", "Степногорск", "Талгар", "Шахтинск",
  "Щучинск", "Аксай", "Аксу", "Алга", "Арысь",
  "Есик", "Жаркент", "Зыряновск", "Кандыагаш", "Шу",
  "Текели", "Ушарал", "Хромтау", "Шардара", "Шемонаиха",
  "Сарань", "Каратау", "Жанатас", "Аральск", "Казалинск"
].sort((a, b) => a.localeCompare(b, "ru"));

const CITY_2GIS_SLUG: Record<string, string> = {
  "Астана": "astana", "Алматы": "almaty", "Шымкент": "shymkent",
  "Актау": "aktau", "Жанаозен": "zhanaozen", "Караганда": "karaganda",
  "Актобе": "aktobe", "Атырау": "atyrau", "Тараз": "taraz",
  "Павлодар": "pavlodar", "Семей": "semey", "Костанай": "kostanay",
  "Кызылорда": "kyzylorda", "Уральск": "oral", "Петропавловск": "petropavl",
  "Темиртау": "temirtau", "Туркестан": "turkistan", "Кокшетау": "kokshetau",
  "Талдыкорган": "taldykorgan", "Экибастуз": "ekibastuz", "Усть-Каменогорск": "ust-kamenogorsk",
};

const build2GisUrl = (city: string, address: string) => {
  const slug = CITY_2GIS_SLUG[city] || "astana";
  return `https://2gis.kz/${slug}/search/${encodeURIComponent(address)}`;
};

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [creds, setCreds] = useState<Credential[]>([]);
  const [form, setForm] = useState({
    name: "",
    city: "Актау",
    categories: [] as string[],
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
    instagram_url: "",
    twogis_url: "",
    price_from: "",
    avatar_url: "",
    gallery: [] as string[],
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error("Не авторизован");
    const validationError = validateImageFile(file);
    if (validationError) throw new Error(validationError);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/admin/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("club-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("club-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, avatar_url: url }));
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryPhoto = (url: string) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((g) => g !== url) }));
  };

  const toggleCategory = (c: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Доступ только для администратора</h1>
          <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold" onClick={() => navigate("/")}>На главную</button>
        </div>
      </div>
    );
  }

  const genPassword = () => Math.random().toString(36).slice(-10) + "A1!";
  const slugifyEmail = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "club";

  const fillAuto = () => {
    const base = slugifyEmail(form.name);
    setForm((f) => ({
      ...f,
      email: f.email || `${base}-${Math.floor(Math.random() * 9999)}@balabagdar.kz`,
      password: f.password || genPassword(),
    }));
  };

  const submit = async () => {
    if (!form.name || !form.city || !form.phone) {
      toast({ title: "Заполните название, город и телефон владельца", variant: "destructive" });
      return;
    }
    if (form.categories.length === 0) {
      toast({ title: "Выберите хотя бы одну категорию", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-club", {
        body: {
          ...form,
          price_from: form.price_from ? Number(form.price_from) : null,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const c = (data as any).credentials;
      setCreds((prev) => [{ name: form.name, email: c.email, password: c.password, city: form.city }, ...prev]);
      toast({ title: "Кружок создан", description: `${c.email} / ${c.password}` });
      setForm({
        name: "", city: form.city, categories: [],
        email: "", password: "", phone: "", address: "", description: "",
        instagram_url: "", twogis_url: "", price_from: "",
        avatar_url: "", gallery: [],
      });
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано" });
  };

  const copyAll = (c: Credential) => {
    copy(`${c.name}\nEmail: ${c.email}\nПароль: ${c.password}\nГород: ${c.city}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-bold mb-4 text-muted-foreground">
          <ArrowLeft size={16} /> Назад
        </button>
        <h1 className="text-3xl font-black mb-1">Админ-панель</h1>
        <p className="text-muted-foreground mb-6">Массовое создание кружков с логином и паролем</p>

        <div className="bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))] space-y-3">
          <h2 className="text-lg font-black flex items-center gap-2"><Plus size={20} /> Новый кружок</h2>

          <Field label="Название*" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <Select label="Город*" value={form.city} options={CITIES} onChange={(v) => setForm({ ...form, city: v, twogis_url: form.address ? build2GisUrl(v, form.address) : form.twogis_url })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Категории и направления (можно несколько)</label>
            <p className="text-xs text-muted-foreground mt-1">Отметьте все виды занятий, которые есть в центре — например «АФК», «Английский язык», «Подготовка к школе», «Логопед». Это поможет родителям найти вас по фильтрам.</p>
            <div className="mt-3 space-y-3">
              {TAXONOMY.map((group) => {
                const groupLabel = t(`cat.${group.id}` as any);
                const groupActive = form.categories.includes(group.id);
                return (
                  <div key={group.id} className="border-2 border-border rounded-2xl p-3 bg-muted/40">
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.id)}
                      className={`px-3 py-1.5 rounded-full border-2 text-xs font-black transition-colors ${groupActive ? "bg-primary text-primary-foreground border-foreground" : "bg-card border-border hover:border-primary"}`}
                    >
                      {group.emoji} {groupLabel} {groupActive && "✓"}
                    </button>
                    {group.subs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.subs.map((s) => {
                          const id = `${group.id}.${s}`;
                          const active = form.categories.includes(id);
                          const label = t(`${group.id}.${s}` as any);
                          return (
                            <button
                              type="button"
                              key={id}
                              onClick={() => toggleCategory(id)}
                              className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors ${active ? "bg-primary text-primary-foreground border-foreground" : "bg-card border-border hover:border-primary"}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {form.categories.length === 0 && (
              <p className="text-xs text-destructive mt-2">Выберите хотя бы одно направление</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Главное фото (обложка)</label>
            <div className="mt-2 flex items-center gap-3">
              {form.avatar_url ? (
                <div className="relative">
                  <img src={form.avatar_url} alt="cover" className="w-24 h-24 rounded-2xl object-cover border-2 border-foreground" />
                  <button type="button" onClick={() => setForm({ ...form, avatar_url: "" })}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 border-2 border-foreground">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center cursor-pointer hover:border-primary">
                  {uploadingAvatar ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} className="text-muted-foreground" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              )}
              <p className="text-xs text-muted-foreground flex-1">Будет показано в карточке и шапке профиля</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Галерея (можно несколько)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.gallery.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="photo" className="w-20 h-20 rounded-xl object-cover border-2 border-border" />
                  <button type="button" onClick={() => removeGalleryPhoto(url)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 border-2 border-foreground">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center cursor-pointer hover:border-primary">
                {uploadingGallery ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} className="text-muted-foreground" />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
              </label>
            </div>
          </div>

          <Field label="Адрес" value={form.address} onChange={(v) => setForm({ ...form, address: v, twogis_url: v ? build2GisUrl(form.city, v) : "" })} />
          <Field label="Телефон владельца* (для входа через Telegram)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => setForm({ ...form, instagram_url: v })} />
          <Field label="2GIS URL (заполняется автоматически из адреса)" value={form.twogis_url} onChange={(v) => setForm({ ...form, twogis_url: v })} />
          <Field label="Цена от (₸)" value={form.price_from} onChange={(v) => setForm({ ...form, price_from: v })} />
          <Field label="Описание" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />

          <p className="text-xs text-muted-foreground pt-2 border-t-2 border-dashed border-border">
            Владелец войдёт через Telegram-бота по указанному номеру телефона. Email и пароль не нужны.
          </p>


          <button onClick={submit} disabled={submitting}
            className="w-full mt-3 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl border-[3px] border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Создать кружок</>}
          </button>
        </div>

        {creds.length > 0 && (
          <div className="mt-6 bg-card border-[3px] border-foreground rounded-3xl p-5 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
            <h2 className="text-lg font-black mb-3">Созданные кружки (в этой сессии)</h2>
            <div className="space-y-3">
              {creds.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted border-2 border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold">{c.name} <span className="text-xs text-muted-foreground">· {c.city}</span></div>
                    <button onClick={() => copyAll(c)} className="text-xs font-bold flex items-center gap-1 text-primary">
                      <Copy size={12} /> Копировать всё
                    </button>
                  </div>
                  <div className="text-xs mt-1 font-mono">
                    <div>Email: <span className="font-bold">{c.email}</span></div>
                    <div>Пароль: <span className="font-bold">{c.password}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">⚠️ Сохраните пароли — они показываются только сейчас.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div>
    <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="mt-1 w-full px-3 py-2 rounded-xl bg-muted border-2 border-border focus:outline-none focus:border-primary text-sm" />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-xl bg-muted border-2 border-border focus:outline-none focus:border-primary text-sm" />
    )}
  </div>
);

const Select = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full px-3 py-2 rounded-xl bg-muted border-2 border-border focus:outline-none focus:border-primary text-sm font-bold">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default AdminPage;
