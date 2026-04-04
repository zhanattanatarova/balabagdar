import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Plus, Trash2, Clock, Camera, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

const categoryOptions = [
  "creativity", "sport", "development", "speech", "dance",
  "robotics", "swim", "music", "health", "tutors", "other",
];

const cities = [
  "Алматы", "Астана", "Шымкент", "Караганда", "Актобе",
  "Тараз", "Павлодар", "Усть-Каменогорск", "Семей", "Атырау",
  "Костанай", "Кызылорда", "Уральск", "Петропавловск", "Актау",
  "Темиртау", "Туркестан", "Кокшетау", "Талдыкорган", "Экибастуз",
];

const dayLabels: Record<string, Record<number, string>> = {
  ru: { 0: "Понедельник", 1: "Вторник", 2: "Среда", 3: "Четверг", 4: "Пятница", 5: "Суббота", 6: "Воскресенье" },
  kz: { 0: "Дүйсенбі", 1: "Сейсенбі", 2: "Сәрсенбі", 3: "Бейсенбі", 4: "Жұма", 5: "Сенбі", 6: "Жексенбі" },
  en: { 0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday" },
};

interface ScheduleItem {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_slots: number;
  isNew?: boolean;
}

const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/club-media`;

const ClubEditPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name_ru: "", name_kz: "", name_en: "",
    description_ru: "", description_kz: "", description_en: "",
    category: "other",
    city: "Астана",
    address: "",
    phone: "",
    whatsapp: "",
    telegram: "",
    instagram: "",
    age_min: 3,
    age_max: 18,
    price_from: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetchClub = async () => {
      const { data } = await supabase.from("clubs").select("*").eq("user_id", user.id).limit(1);
      if (data?.[0]) {
        const c = data[0];
        setClubId(c.id);
        setAvatarUrl(c.avatar_url || "");
        setGallery(c.gallery || []);
        setForm({
          name_ru: c.name_ru || "", name_kz: c.name_kz || "", name_en: c.name_en || "",
          description_ru: c.description_ru || "", description_kz: c.description_kz || "", description_en: c.description_en || "",
          category: c.category || "other",
          city: c.city || "Астана",
          address: c.address || "",
          phone: c.phone || "",
          whatsapp: c.whatsapp || "",
          telegram: c.telegram || "",
          instagram: c.instagram || "",
          age_min: c.age_min ?? 3,
          age_max: c.age_max ?? 18,
          price_from: c.price_from ?? 0,
        });
        const { data: sched } = await supabase.from("club_schedules").select("*").eq("club_id", c.id).order("day_of_week");
        if (sched) setSchedules(sched.map((s) => ({ ...s, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5) })));
      }
      setLoading(false);
    };
    fetchClub();
  }, [user]);

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from("club-media").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return null;
    }
    return `${STORAGE_URL}/${path}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const url = await uploadFile(file, path);
    if (url) setAvatarUrl(url + `?t=${Date.now()}`);
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploadingGallery(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/gallery_${Date.now()}_${i}.${ext}`;
      const url = await uploadFile(file, path);
      if (url) newUrls.push(url);
    }
    setGallery((prev) => [...prev, ...newUrls]);
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name_ru.trim()) {
      toast({ title: t("common.error"), description: "Введите название кружка", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = { ...form, user_id: user.id, avatar_url: avatarUrl, gallery };
    let savedClubId = clubId;
    let error;

    if (clubId) {
      ({ error } = await supabase.from("clubs").update(payload).eq("id", clubId));
    } else {
      const { data, error: insertError } = await supabase.from("clubs").insert(payload).select().single();
      error = insertError;
      if (data) { setClubId(data.id); savedClubId = data.id; }
    }

    if (!error && savedClubId) {
      await supabase.from("club_schedules").delete().eq("club_id", savedClubId);
      if (schedules.length > 0) {
        const schedPayload = schedules.map((s) => ({
          club_id: savedClubId!,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          max_slots: s.max_slots,
        }));
        const { error: schedError } = await supabase.from("club_schedules").insert(schedPayload);
        if (schedError) error = schedError;
      }
    }

    setSaving(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("edit.saved") });
      navigate("/dashboard");
    }
  };

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const addSchedule = () => {
    setSchedules((prev) => [...prev, { day_of_week: 0, start_time: "09:00", end_time: "10:00", max_slots: 10, isNew: true }]);
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    setSchedules((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const inputCls = "w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "text-xs font-bold text-muted-foreground";
  const textareaCls = inputCls + " resize-none";

  const days = dayLabels[lang] || dayLabels.ru;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black">{clubId ? t("dashboard.edit_profile") : t("dashboard.create_club")}</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Avatar & Gallery */}
        <div className="cartoon-card p-4 space-y-4">
          <p className="text-sm font-black">📷 Фото</p>
          
          {/* Avatar */}
          <div>
            <label className={labelCls}>Аватар кружка</label>
            <div className="mt-2 flex items-center gap-4">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 size={20} className="animate-spin text-primary" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={24} className="text-primary/50" />
                )}
              </div>
              <div className="text-xs text-muted-foreground font-bold">
                Нажмите чтобы загрузить<br />или сменить аватар
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Gallery */}
          <div>
            <label className={labelCls}>Галерея (до 10 фото)</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {gallery.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                  >
                    <X size={10} className="text-destructive-foreground" />
                  </button>
                </div>
              ))}
              {gallery.length < 10 && (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary transition-colors"
                >
                  {uploadingGallery ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <ImagePlus size={20} className="text-primary/50" />
                  )}
                </button>
              )}
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
          </div>
        </div>

        {/* Name in 3 languages */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📝 {t("edit.name")}</p>
          <div><label className={labelCls}>🇷🇺 Русский</label><input value={form.name_ru} onChange={(e) => update("name_ru", e.target.value)} placeholder="Название кружка" className={inputCls} /></div>
          <div><label className={labelCls}>🇰🇿 Қазақша</label><input value={form.name_kz} onChange={(e) => update("name_kz", e.target.value)} placeholder="Үйірме атауы" className={inputCls} /></div>
          <div><label className={labelCls}>🇬🇧 English</label><input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} placeholder="Club name" className={inputCls} /></div>
        </div>

        {/* Description */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📋 {t("edit.description")}</p>
          <div><label className={labelCls}>🇷🇺 Русский</label><textarea value={form.description_ru} onChange={(e) => update("description_ru", e.target.value)} rows={3} placeholder="Расскажите о вашем кружке..." className={textareaCls} /></div>
          <div><label className={labelCls}>🇰🇿 Қазақша</label><textarea value={form.description_kz} onChange={(e) => update("description_kz", e.target.value)} rows={3} placeholder="Үйірмеңіз туралы..." className={textareaCls} /></div>
          <div><label className={labelCls}>🇬🇧 English</label><textarea value={form.description_en} onChange={(e) => update("description_en", e.target.value)} rows={3} placeholder="Tell about your club..." className={textareaCls} /></div>
        </div>

        {/* Category & City */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">🏷️ {t("edit.category")} & {t("edit.city")}</p>
          <div>
            <label className={labelCls}>{t("edit.category")}</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{t(`cat.${c}` as any) || c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("edit.city")}</label>
            <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls}>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div><label className={labelCls}>📍 {t("edit.address")}</label><input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="ул. Абая, 15, 2 этаж" className={inputCls} /></div>
        </div>

        {/* Contacts */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📞 {t("club.contacts")}</p>
          <div><label className={labelCls}>{t("edit.phone")}</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+7 777 123 4567" className={inputCls} /></div>
          <div><label className={labelCls}>💬 {t("edit.whatsapp")}</label><input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+77771234567" className={inputCls} /></div>
          <div><label className={labelCls}>✈️ {t("edit.telegram")}</label><input value={form.telegram} onChange={(e) => update("telegram", e.target.value)} placeholder="@username" className={inputCls} /></div>
          <div><label className={labelCls}>📸 Instagram</label><input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@username" className={inputCls} /></div>
        </div>

        {/* Age & Price */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">👶 {t("edit.age_range")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Мин. возраст</label><input type="number" value={form.age_min} onChange={(e) => update("age_min", parseInt(e.target.value) || 0)} className={inputCls} /></div>
            <div><label className={labelCls}>Макс. возраст</label><input type="number" value={form.age_max} onChange={(e) => update("age_max", parseInt(e.target.value) || 0)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>💰 {t("edit.price")}</label><input type="number" value={form.price_from} onChange={(e) => update("price_from", parseInt(e.target.value) || 0)} placeholder="15000" className={inputCls} /></div>
        </div>

        {/* Schedule */}
        <div className="cartoon-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black">📅 {t("club.schedule")}</p>
            <button onClick={addSchedule} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
              <Plus size={14} /> Добавить
            </button>
          </div>

          {schedules.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Нет расписания. Нажмите «Добавить» чтобы указать время занятий.</p>
          )}

          {schedules.map((sched, i) => (
            <div key={i} className="bg-muted rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <select
                  value={sched.day_of_week}
                  onChange={(e) => updateSchedule(i, "day_of_week", parseInt(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>{days[d]}</option>
                  ))}
                </select>
                <button onClick={() => removeSchedule(i)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground">Начало</label>
                  <input
                    type="time"
                    value={sched.start_time}
                    onChange={(e) => updateSchedule(i, "start_time", e.target.value)}
                    className="w-full mt-0.5 px-2 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground">Конец</label>
                  <input
                    type="time"
                    value={sched.end_time}
                    onChange={(e) => updateSchedule(i, "end_time", e.target.value)}
                    className="w-full mt-0.5 px-2 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground">Мест</label>
                  <input
                    type="number"
                    value={sched.max_slots}
                    onChange={(e) => updateSchedule(i, "max_slots", parseInt(e.target.value) || 1)}
                    className="w-full mt-0.5 px-2 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {t("edit.save")}</>}
        </button>
      </div>
    </div>
  );
};

export default ClubEditPage;
