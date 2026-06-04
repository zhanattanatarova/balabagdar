import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Plus, ArrowLeft } from "lucide-react";

type Credential = { name: string; email: string; password: string; city: string };

const CITIES = ["Актау", "Алматы", "Астана", "Шымкент", "Караганда", "Атырау", "Актобе", "Уральск", "Костанай", "Павлодар"];
const CATEGORIES = ["development", "sport", "art", "music", "languages", "dance", "robotics", "science", "academic"];

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [creds, setCreds] = useState<Credential[]>([]);
  const [form, setForm] = useState({
    name: "",
    city: "Актау",
    category: "development",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
    instagram_url: "",
    twogis_url: "",
    price_from: "",
  });

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
    if (!form.name || !form.city) {
      toast({ title: "Заполните название и город", variant: "destructive" });
      return;
    }
    if (!form.email || !form.password) fillAuto();
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
        name: "", city: form.city, category: "development",
        email: "", password: "", phone: "", address: "", description: "",
        instagram_url: "", twogis_url: "", price_from: "",
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
          <div className="grid grid-cols-2 gap-3">
            <Select label="Город*" value={form.city} options={CITIES} onChange={(v) => setForm({ ...form, city: v })} />
            <Select label="Категория" value={form.category} options={CATEGORIES} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <Field label="Адрес" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label="Телефон" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => setForm({ ...form, instagram_url: v })} />
          <Field label="2GIS URL" value={form.twogis_url} onChange={(v) => setForm({ ...form, twogis_url: v })} />
          <Field label="Цена от (₸)" value={form.price_from} onChange={(v) => setForm({ ...form, price_from: v })} />
          <Field label="Описание" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />

          <div className="pt-2 border-t-2 border-dashed border-border" />
          <p className="text-xs font-bold uppercase text-muted-foreground">Доступ владельца кружка</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email логин" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Пароль" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          </div>
          <button onClick={fillAuto} className="text-xs font-bold text-primary">Сгенерировать автоматически</button>

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
