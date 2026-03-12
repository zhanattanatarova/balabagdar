import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Plus, Trash2, Clock } from "lucide-react";
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

const ClubEditPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [form, setForm] = useState({
    name_ru: "", name_kz: "", name_en: "",
    description_ru: "", description_kz: "", description_en: "",
    category: "other",
    city: "Астана",
    address: "",
    phone: "",
    whatsapp: "",
    telegram: "",
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
        setForm({
          name_ru: c.name_ru || "", name_kz: c.name_kz || "", name_en: c.name_en || "",
          description_ru: c.description_ru || "", description_kz: c.description_kz || "", description_en: c.description_en || "",
          category: c.category || "other",
          city: c.city || "Астана",
          address: c.address || "",
          phone: c.phone || "",
          whatsapp: c.whatsapp || "",
          telegram: c.telegram || "",
          age_min: c.age_min ?? 3,
          age_max: c.age_max ?? 18,
          price_from: c.price_from ?? 0,
        });
        // Load schedules
        const { data: sched } = await supabase.from("club_schedules").select("*").eq("club_id", c.id).order("day_of_week");
        if (sched) setSchedules(sched.map((s) => ({ ...s, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5) })));
      }
      setLoading(false);
    };
    fetchClub();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.name_ru.trim()) {
      toast({ title: t("common.error"), description: "Введите название кружка", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = { ...form, user_id: user.id };
    let savedClubId = clubId;
    let error;

    if (clubId) {
      ({ error } = await supabase.from("clubs").update(payload).eq("id", clubId));
    } else {
      const { data, error: insertError } = await supabase.from("clubs").insert(payload).select().single();
      error = insertError;
      if (data) { setClubId(data.id); savedClubId = data.id; }
    }

    // Save schedules
    if (!error && savedClubId) {
      // Delete old schedules
      await supabase.from("club_schedules").delete().eq("club_id", savedClubId);
      // Insert new ones
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

  const InputField = ({ label, field, type = "text", placeholder = "" }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={(form as any)[field]}
        onChange={(e) => update(field, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  const TextAreaField = ({ label, field, placeholder = "" }: { label: string; field: string; placeholder?: string }) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <textarea
        value={(form as any)[field]}
        onChange={(e) => update(field, e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  );

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
        {/* Name in 3 languages */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📝 {t("edit.name")}</p>
          <InputField label="🇷🇺 Русский" field="name_ru" placeholder="Название кружка" />
          <InputField label="🇰🇿 Қазақша" field="name_kz" placeholder="Үйірме атауы" />
          <InputField label="🇬🇧 English" field="name_en" placeholder="Club name" />
        </div>

        {/* Description */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📋 {t("edit.description")}</p>
          <TextAreaField label="🇷🇺 Русский" field="description_ru" placeholder="Расскажите о вашем кружке: чему учите, какие достижения, методы..." />
          <TextAreaField label="🇰🇿 Қазақша" field="description_kz" placeholder="Үйірмеңіз туралы айтып беріңіз..." />
          <TextAreaField label="🇬🇧 English" field="description_en" placeholder="Tell about your club..." />
        </div>

        {/* Category & City */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">🏷️ {t("edit.category")} & {t("edit.city")}</p>
          <div>
            <label className="text-xs font-bold text-muted-foreground">{t("edit.category")}</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary">
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{t(`cat.${c}` as any) || c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">{t("edit.city")}</label>
            <select value={form.city} onChange={(e) => update("city", e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary">
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <InputField label={`📍 ${t("edit.address")}`} field="address" placeholder="ул. Абая, 15, 2 этаж" />
        </div>

        {/* Contacts */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">📞 {t("club.contacts")}</p>
          <InputField label={t("edit.phone")} field="phone" placeholder="+7 777 123 4567" />
          <InputField label={`💬 ${t("edit.whatsapp")}`} field="whatsapp" placeholder="+77771234567" />
          <InputField label={`✈️ ${t("edit.telegram")}`} field="telegram" placeholder="@username" />
        </div>

        {/* Age & Price */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">👶 {t("edit.age_range")}</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Мин. возраст" field="age_min" type="number" />
            <InputField label="Макс. возраст" field="age_max" type="number" />
          </div>
          <InputField label={`💰 ${t("edit.price")}`} field="price_from" type="number" placeholder="15000" />
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
