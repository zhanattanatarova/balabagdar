import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Plus, Trash2, Camera, X, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

const categoryOptions = [
  { id: "sport", emoji: "⚽" },
  { id: "dance", emoji: "💃" },
  { id: "music", emoji: "🎵" },
  { id: "creativity", emoji: "🎨" },
  { id: "languages", emoji: "🌍" },
  { id: "tutors", emoji: "📚" },
  { id: "robotics", emoji: "🤖" },
  { id: "swim", emoji: "🏊" },
  { id: "development", emoji: "🧠" },
  { id: "speech", emoji: "🗣️" },
  { id: "health", emoji: "❤️" },
  { id: "special", emoji: "⭐" },
  { id: "kindergarten", emoji: "🏠" },
  { id: "other", emoji: "✨" },
];

const subcategoryOptions: Record<string, { id: string; label: string }[]> = {
  health: [
    { id: "massage", label: "💆 Массаж" }, { id: "pediatrician", label: "👶 Педиатр" },
    { id: "psychologist", label: "🧠 Психолог" }, { id: "speech_therapist", label: "🗣️ Логопед" },
    { id: "lfk", label: "🤸 ЛФК" }, { id: "dentist", label: "🦷 Стоматолог" },
    { id: "neurologist", label: "🧬 Невролог" }, { id: "nutritionist", label: "🥗 Нутрициолог" },
    { id: "ophthalmologist", label: "👁️ Окулист" }, { id: "orthopedist", label: "🦴 Ортопед" },
    { id: "osteopath", label: "🤲 Остеопат" }, { id: "allergist", label: "🤧 Аллерголог" },
    { id: "ent", label: "👂 ЛОР" }, { id: "vaccination", label: "💉 Вакцинация" },
    { id: "defectologist", label: "📚 Дефектолог" },
  ],
  dance: [
    { id: "ballet", label: "🩰 Балет" }, { id: "ballroom", label: "🕺 Бальные" },
    { id: "sport", label: "🏆 Спортивные" }, { id: "modern", label: "✨ Современные" },
    { id: "hiphop", label: "🎤 Хип-хоп" }, { id: "folk", label: "🪘 Народные" },
    { id: "latin", label: "🌶️ Латино" }, { id: "breakdance", label: "🕺 Брейк-данс" },
    { id: "contemporary", label: "🎭 Контемпорари" }, { id: "oriental", label: "🪷 Восточные" },
  ],
  sport: [
    { id: "gymnastics", label: "🤸 Гимнастика" }, { id: "karate", label: "🥋 Каратэ" },
    { id: "judo", label: "🥋 Дзюдо" }, { id: "taekwondo", label: "🥋 Тхэквондо" },
    { id: "boxing", label: "🥊 Бокс" }, { id: "wrestling", label: "🤼 Борьба" },
    { id: "football", label: "⚽ Футбол" }, { id: "basketball", label: "🏀 Баскетбол" },
    { id: "volleyball", label: "🏐 Волейбол" }, { id: "tennis", label: "🎾 Теннис" },
    { id: "hockey", label: "🏒 Хоккей" }, { id: "chess", label: "♟️ Шахматы" },
    { id: "skating", label: "⛸️ Фигурное катание" }, { id: "athletics", label: "🏃 Лёгкая атлетика" },
  ],
  tutors: [
    { id: "school_prep", label: "📚 Подготовка к школе" }, { id: "kazakh", label: "🇰🇿 Казахский" },
    { id: "russian", label: "🇷🇺 Русский" }, { id: "english", label: "🇬🇧 Английский" },
    { id: "math", label: "➕ Математика" }, { id: "physics", label: "⚡ Физика" },
    { id: "chemistry", label: "🧪 Химия" }, { id: "biology", label: "🌿 Биология" },
    { id: "ent", label: "📝 ЕНТ" }, { id: "olympiad", label: "🏆 Олимпиады" },
  ],
  creativity: [
    { id: "drawing", label: "🎨 Рисование" }, { id: "painting", label: "🖌️ Живопись" },
    { id: "handicraft", label: "🧶 Рукоделие" }, { id: "sculpting", label: "🏺 Лепка" },
    { id: "pottery", label: "🫙 Гончарное" },
  ],
  music: [
    { id: "guitar", label: "🎸 Гитара" }, { id: "piano", label: "🎹 Пианино" },
    { id: "violin", label: "🎻 Скрипка" }, { id: "vocal", label: "🎤 Вокал" },
    { id: "drums", label: "🥁 Барабаны" },
  ],
  special: [
    { id: "aba", label: "🧩 ABA-терапия" }, { id: "sensory", label: "🌈 Сенсорная интеграция" },
    { id: "speech", label: "🗣️ Логопед-дефектолог" }, { id: "psychologist", label: "🧠 Детский психолог" },
    { id: "afk", label: "🏃 АФК" }, { id: "lfk", label: "🤸 ЛФК" },
    { id: "art", label: "🎨 Арт-терапия" }, { id: "music", label: "🎵 Музыкотерапия" },
    { id: "inclusive", label: "♾️ Инклюзивный" },
  ],
  languages: [
    { id: "english", label: "🇬🇧 Английский" }, { id: "chinese", label: "🇨🇳 Китайский" },
    { id: "french", label: "🇫🇷 Французский" }, { id: "korean", label: "🇰🇷 Корейский" },
    { id: "turkish", label: "🇹🇷 Турецкий" }, { id: "kazakh", label: "🇰🇿 Казахский" },
    { id: "german", label: "🇩🇪 Немецкий" }, { id: "arabic", label: "🇸🇦 Арабский" },
  ],
};

const cities = [
  "Алматы", "Астана", "Шымкент", "Караганда", "Актобе",
  "Тараз", "Павлодар", "Усть-Каменогорск", "Семей", "Атырау",
  "Костанай", "Кызылорда", "Уральск", "Петропавловск", "Актау",
  "Темиртау", "Туркестан", "Кокшетау", "Талдыкорган", "Экибастуз",
];

const AGE_PRESETS = [
  { label: "0–3", min: 0, max: 3 },
  { label: "3–7", min: 3, max: 7 },
  { label: "7–12", min: 7, max: 12 },
  { label: "12+", min: 12, max: 18 },
];

const TEACHING_LANGS = [
  { id: "kz", flag: "🇰🇿", label: "Қазақша" },
  { id: "ru", flag: "🇷🇺", label: "Русский" },
  { id: "en", flag: "🇬🇧", label: "English" },
];

const FORM_LANGS = [
  { id: "ru", flag: "🇷🇺", label: "Русский", placeholder: { name: "Название кружка", desc: "Расскажите о вашем кружке, чем занимаетесь, для кого..." } },
  { id: "kz", flag: "🇰🇿", label: "Қазақша", placeholder: { name: "Үйірме атауы", desc: "Үйірмеңіз туралы айтыңыз..." } },
  { id: "en", flag: "🇬🇧", label: "English", placeholder: { name: "Club name", desc: "Tell about your club..." } },
];

const dayLabels: Record<string, Record<number, string>> = {
  ru: { 0: "Пн", 1: "Вт", 2: "Ср", 3: "Чт", 4: "Пт", 5: "Сб", 6: "Вс" },
  kz: { 0: "Дс", 1: "Сс", 2: "Ср", 3: "Бс", 4: "Жм", 5: "Сн", 6: "Жс" },
  en: { 0: "Mo", 1: "Tu", 2: "We", 3: "Th", 4: "Fr", 5: "Sa", 6: "Su" },
};

interface ScheduleItem {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_slots: number;
  isNew?: boolean;
}

const ClubEditPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<"lang" | "form">("lang");
  const [formLang, setFormLang] = useState<"ru" | "kz" | "en">("ru");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [agePreset, setAgePreset] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name_ru: "", name_kz: "", name_en: "",
    description_ru: "", description_kz: "", description_en: "",
    category: "other",
    subcategory: "",
    city: "Астана",
    address: "",
    phone: "",
    whatsapp: "",
    telegram: "",
    gis_url: "",
    age_min: 3,
    age_max: 18,
    price_from: 0,
    instructor: "",
    teaching_languages: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    const fetchClub = async () => {
      try {
        const c = await api.clubs.my();
        if (c) {
          setClubId(c.id);
          setAvatarUrl(c.avatarUrl || c.avatar_url || "");
          const tl = c.teachingLanguages || c.teaching_languages || [];
          setForm({
            name_ru: c.nameRu || c.name_ru || "",
            name_kz: c.nameKz || c.name_kz || "",
            name_en: c.nameEn || c.name_en || "",
            description_ru: c.descriptionRu || c.description_ru || "",
            description_kz: c.descriptionKz || c.description_kz || "",
            description_en: c.descriptionEn || c.description_en || "",
            category: c.category || "other",
            subcategory: c.subcategory || "",
            city: c.city || "Астана",
            address: c.address || "",
            phone: c.phone || "",
            whatsapp: c.whatsapp || "",
            telegram: c.telegram || "",
            gis_url: c.gisUrl || c.gis_url || "",
            age_min: c.ageMin ?? c.age_min ?? 3,
            age_max: c.ageMax ?? c.age_max ?? 18,
            price_from: c.priceFrom ?? c.price_from ?? 0,
            instructor: c.instructor || "",
            teaching_languages: Array.isArray(tl) ? tl : [],
          });
          const sched = await api.clubs.schedules(c.id);
          if (sched) {
            setSchedules(sched.map((s: any) => ({
              id: s.id,
              day_of_week: s.dayOfWeek ?? s.day_of_week,
              start_time: (s.startTime || s.start_time || "")?.slice(0, 5),
              end_time: (s.endTime || s.end_time || "")?.slice(0, 5),
              max_slots: s.maxSlots ?? s.max_slots ?? 10,
            })));
          }
          // Determine form language from existing data
          if (c.nameKz && !c.nameRu) setFormLang("kz");
          else if (c.nameEn && !c.nameRu && !c.nameKz) setFormLang("en");
          setStep("form");
        }
      } catch {}
      setLoading(false);
    };
    fetchClub();
  }, [user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await api.upload.file(file);
      setAvatarUrl(url);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const name = formLang === "ru" ? form.name_ru : formLang === "kz" ? form.name_kz : form.name_en;
    if (!name.trim()) {
      toast({ title: t("common.error"), description: "Введите название", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      avatar_url: avatarUrl,
      gallery: [],
      schedules: schedules.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        max_slots: s.max_slots,
      })),
    };
    try {
      if (clubId) {
        await api.clubs.update(clubId, payload);
      } else {
        const created = await api.clubs.create(payload);
        setClubId(created.id);
      }
      toast({ title: t("edit.saved") });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const toggleTeachingLang = (id: string) => {
    setForm((p) => ({
      ...p,
      teaching_languages: p.teaching_languages.includes(id)
        ? p.teaching_languages.filter((l) => l !== id)
        : [...p.teaching_languages, id],
    }));
  };

  const applyAgePreset = (preset: typeof AGE_PRESETS[0]) => {
    setAgePreset(preset.label);
    update("age_min", preset.min);
    update("age_max", preset.max);
  };

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
  const days = dayLabels[lang] || dayLabels.ru;
  const fl = FORM_LANGS.find((f) => f.id === formLang) || FORM_LANGS[0];
  const nameKey = `name_${formLang}` as "name_ru" | "name_kz" | "name_en";
  const descKey = `description_${formLang}` as "description_ru" | "description_kz" | "description_en";

  if (step === "lang") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-10 bg-background">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌐</div>
          <h1 className="text-xl font-black">На каком языке заполнить анкету?</h1>
          <p className="text-sm text-muted-foreground mt-2 font-bold">Қай тілде толтырасыз? / Which language?</p>
        </div>
        <div className="w-full max-w-sm space-y-3">
          {FORM_LANGS.map((fl) => (
            <button
              key={fl.id}
              onClick={() => { setFormLang(fl.id as any); setStep("form"); }}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border-[3px] border-border hover:border-primary hover:bg-primary/5 transition-all font-black text-lg active:scale-[0.98]"
            >
              <span className="text-3xl">{fl.flag}</span>
              <span>{fl.label}</span>
              <ArrowLeft size={18} className="ml-auto rotate-180 text-primary" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => setStep("lang")} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black">{clubId ? t("dashboard.edit_profile") : t("dashboard.create_club")}</h1>
          <p className="text-xs text-muted-foreground font-bold">{fl.flag} {fl.label}</p>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* Photo */}
        <div className="cartoon-card p-4">
          <p className="text-sm font-black mb-3">📷 Фото кружка</p>
          <div className="flex items-center gap-4">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors shrink-0"
            >
              {uploadingAvatar ? (
                <Loader2 size={20} className="animate-spin text-primary" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-primary/50" />
              )}
            </div>
            <div className="text-xs text-muted-foreground font-bold leading-relaxed">
              Нажмите чтобы загрузить фото.<br />
              Это привлечёт больше родителей.
            </div>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>

        {/* Name */}
        <div className="cartoon-card p-4 space-y-2">
          <p className="text-sm font-black">🏫 Название центра *</p>
          <input
            value={form[nameKey]}
            onChange={(e) => update(nameKey, e.target.value)}
            placeholder={fl.placeholder.name}
            className={inputCls}
          />
        </div>

        {/* Category */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">🏷️ {t("edit.category")} *</p>
          <div className="grid grid-cols-7 gap-2">
            {categoryOptions.map((cat) => {
              const isActive = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { update("category", cat.id); update("subcategory", ""); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${isActive ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-primary/5"}`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[9px] font-bold leading-tight">{t(`cat.${cat.id}` as any)}</span>
                </button>
              );
            })}
          </div>
          {subcategoryOptions[form.category] && (
            <div>
              <label className={labelCls}>Специализация</label>
              <select
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                className={inputCls}
              >
                <option value="">— Не указано —</option>
                {subcategoryOptions[form.category].map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Activities description */}
        <div className="cartoon-card p-4 space-y-2">
          <p className="text-sm font-black">📚 Что за занятия? *</p>
          <textarea
            value={form[descKey]}
            onChange={(e) => update(descKey, e.target.value)}
            rows={4}
            placeholder={fl.placeholder.desc}
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Teaching languages */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">🗣️ На каких языках ведутся занятия?</p>
          <div className="flex gap-2">
            {TEACHING_LANGS.map((tl) => {
              const isActive = form.teaching_languages.includes(tl.id);
              return (
                <button
                  key={tl.id}
                  onClick={() => toggleTeachingLang(tl.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${isActive ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted"}`}
                >
                  <span className="text-2xl">{tl.flag}</span>
                  <span className="text-xs">{tl.label}</span>
                  {isActive && <Check size={14} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructor */}
        <div className="cartoon-card p-4 space-y-2">
          <p className="text-sm font-black">👨‍🏫 Преподаватель <span className="font-normal text-muted-foreground">(необязательно)</span></p>
          <input
            value={form.instructor}
            onChange={(e) => update("instructor", e.target.value)}
            placeholder="Имя педагога, квалификация..."
            className={inputCls}
          />
        </div>

        {/* Age range */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">👶 Возраст детей *</p>
          <div className="flex gap-2">
            {AGE_PRESETS.map((preset) => {
              const isActive = agePreset === preset.label;
              return (
                <button
                  key={preset.label}
                  onClick={() => applyAgePreset(preset)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-black transition-all ${isActive ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted"}`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Мин. возраст (лет)</label>
              <input
                type="number"
                value={form.age_min}
                onChange={(e) => { setAgePreset(null); update("age_min", parseInt(e.target.value) || 0); }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Макс. возраст (лет)</label>
              <input
                type="number"
                value={form.age_max}
                onChange={(e) => { setAgePreset(null); update("age_max", parseInt(e.target.value) || 0); }}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* City & Address */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">🏙️ Город и адрес</p>
          <div>
            <label className={labelCls}>{t("edit.city")} *</label>
            <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls}>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className={labelCls}>📍 {t("edit.address")}</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="ул. Абая, 15, 2 этаж" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>🗺️ Ссылка на 2GIS</label>
            <input value={form.gis_url} onChange={(e) => update("gis_url", e.target.value)} placeholder="https://2gis.kz/..." className={inputCls} />
          </div>
        </div>

        {/* Contacts */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📞 Контакты</p>
          <div>
            <label className={labelCls}>{t("edit.phone")} *</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+7 777 123 4567" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>💬 WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+77771234567" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>✈️ Telegram</label>
            <input value={form.telegram} onChange={(e) => update("telegram", e.target.value)} placeholder="@username" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>💰 {t("edit.price")} (₸/мес)</label>
            <input type="number" value={form.price_from} onChange={(e) => update("price_from", parseInt(e.target.value) || 0)} placeholder="15000" className={inputCls} />
          </div>
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
            <p className="text-xs text-muted-foreground text-center py-3 font-bold">Нажмите «Добавить» чтобы указать время занятий</p>
          )}
          {schedules.map((sched, i) => (
            <div key={i} className="bg-muted rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <select
                  value={sched.day_of_week}
                  onChange={(e) => updateSchedule(i, "day_of_week", parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>{days[d]}</option>
                  ))}
                </select>
                <input type="time" value={sched.start_time} onChange={(e) => updateSchedule(i, "start_time", e.target.value)}
                  className="px-2 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                <span className="text-xs font-bold text-muted-foreground">—</span>
                <input type="time" value={sched.end_time} onChange={(e) => updateSchedule(i, "end_time", e.target.value)}
                  className="px-2 py-2 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={() => removeSchedule(i)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-muted-foreground">Мест:</label>
                <input type="number" value={sched.max_slots} onChange={(e) => updateSchedule(i, "max_slots", parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {t("edit.save")}</>}
        </button>
      </div>
    </div>
  );
};

export default ClubEditPage;
