import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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

const ClubEditPage = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);

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
      }
      setLoading(false);
    };
    fetchClub();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = { ...form, user_id: user.id };

    let error;
    if (clubId) {
      ({ error } = await supabase.from("clubs").update(payload).eq("id", clubId));
    } else {
      const { data, error: insertError } = await supabase.from("clubs").insert(payload).select().single();
      error = insertError;
      if (data) setClubId(data.id);
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

  const TextAreaField = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <textarea
        value={(form as any)[field]}
        onChange={(e) => update(field, e.target.value)}
        rows={3}
        className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  );

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
          <p className="text-sm font-black">{t("edit.name")}</p>
          <InputField label="🇷🇺 Русский" field="name_ru" />
          <InputField label="🇰🇿 Қазақша" field="name_kz" />
          <InputField label="🇬🇧 English" field="name_en" />
        </div>

        {/* Description */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">{t("edit.description")}</p>
          <TextAreaField label="🇷🇺 Русский" field="description_ru" />
          <TextAreaField label="🇰🇿 Қазақша" field="description_kz" />
          <TextAreaField label="🇬🇧 English" field="description_en" />
        </div>

        {/* Category & City */}
        <div className="cartoon-card p-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground">{t("edit.category")}</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{t(`cat.${c}` as any) || c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">{t("edit.city")}</label>
            <select
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <InputField label={t("edit.address")} field="address" placeholder="ул. Абая, 15" />
        </div>

        {/* Contacts */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">{t("club.contacts")}</p>
          <InputField label={t("edit.phone")} field="phone" placeholder="+7 777 123 4567" />
          <InputField label={t("edit.whatsapp")} field="whatsapp" placeholder="+77771234567" />
          <InputField label={t("edit.telegram")} field="telegram" placeholder="@username" />
        </div>

        {/* Age & Price */}
        <div className="cartoon-card p-4 space-y-3">
          <p className="text-sm font-black">{t("edit.age_range")}</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Min" field="age_min" type="number" />
            <InputField label="Max" field="age_max" type="number" />
          </div>
          <InputField label={t("edit.price")} field="price_from" type="number" />
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
