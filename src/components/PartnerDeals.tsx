import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const UI = {
  ru: { title: "Акции, пробные занятия и программы на каникулы", add: "Добавить", promo: "Акция", trial: "Пробное занятие", name: "Заголовок*", body: "Описание*", until: "Действует до*", discount: "Скидка (например −20%)", free: "Бесплатно", price: "Цена, ₸", phone: "Телефон", season: "Каникулы", none: "Не относится", winter: "Зимние", spring: "Весенние", summer: "Летние", send: "Отправить на модерацию", sent: "Отправлено. Публикация появится после проверки администратором.", pending: "На модерации", live: "Опубликовано", fill: "Заполните заголовок, описание и срок" },
  kz: { title: "Акциялар, сынақ сабақтары және демалыс бағдарламалары", add: "Қосу", promo: "Акция", trial: "Сынақ сабағы", name: "Тақырып*", body: "Сипаттама*", until: "Мерзімі*", discount: "Жеңілдік (мысалы −20%)", free: "Тегін", price: "Бағасы, ₸", phone: "Телефон", season: "Демалыс", none: "Қатысы жоқ", winter: "Қысқы", spring: "Көктемгі", summer: "Жазғы", send: "Модерацияға жіберу", sent: "Жіберілді. Әкімші тексергеннен кейін жарияланады.", pending: "Модерацияда", live: "Жарияланды", fill: "Тақырыпты, сипаттаманы және мерзімді толтырыңыз" },
  en: { title: "Deals, trial classes and holiday programs", add: "Add", promo: "Deal", trial: "Trial class", name: "Title*", body: "Description*", until: "Valid until*", discount: "Discount (e.g. −20%)", free: "Free", price: "Price, ₸", phone: "Phone", season: "Holidays", none: "Not related", winter: "Winter", spring: "Spring", summer: "Summer", send: "Send for review", sent: "Sent. It will appear after admin review.", pending: "In review", live: "Published", fill: "Fill in title, description and validity date" },
};

export default function PartnerDeals({ club }: { club: { id: string; city: string; name_ru: string; phone?: string | null } }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const ui = UI[lang];
  const [open, setOpen] = useState(false);
  const [mine, setMine] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ category: "promo", title: "", body: "", deal_until: "", discount_text: "", is_free: false, price_from: "", phone: club.phone || "", season: "" });
  const load = () => user && (supabase as any).from("announcements").select("id,title,category,is_approved,deal_until").eq("user_id", user.id).in("category", ["promo", "trial"]).order("created_at", { ascending: false }).then(({ data }: any) => setMine(data || []));
  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user || !f.title.trim() || !f.body.trim() || !f.deal_until) { toast({ title: ui.fill, variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("announcements").insert({
      user_id: user.id, club_id: club.id, city: club.city, name: club.name_ru, category: f.category,
      title: f.title.trim(), body: f.body.trim(), phone: f.phone.trim(), deal_until: f.deal_until,
      discount_text: f.discount_text.trim() || null, is_free: f.is_free, price_from: !f.is_free && f.price_from ? Number(f.price_from) : null,
      season: f.season || null, expires_at: new Date(`${f.deal_until}T23:59:59+05:00`).toISOString(),
    });
    setSaving(false);
    if (error) { toast({ title: "Ошибка", description: error.message, variant: "destructive" }); return; }
    toast({ title: ui.sent });
    setOpen(false); setF({ ...f, title: "", body: "", deal_until: "", discount_text: "", price_from: "" }); load();
  };

  return (
    <div className="mx-4 mt-4 cartoon-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-black text-sm">{ui.title}</h2>
        <Button size="sm" onClick={() => setOpen(!open)}><Plus size={14} />{ui.add}</Button>
      </div>
      {mine.map((m) => (
        <div key={m.id} className="mt-2 text-xs font-bold flex justify-between gap-2"><span>{m.title}</span><span className={m.is_approved ? "text-primary" : "text-muted-foreground"}>{m.is_approved ? ui.live : ui.pending}</span></div>
      ))}
      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {(["promo", "trial"] as const).map((c) => <Button key={c} type="button" size="sm" variant={f.category === c ? "default" : "outline"} onClick={() => setF({ ...f, category: c })}>{ui[c]}</Button>)}
          </div>
          <div><Label>{ui.name}</Label><Input maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>{ui.body}</Label><Textarea rows={4} maxLength={1500} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>{ui.until}</Label><Input type="date" value={f.deal_until} onChange={(e) => setF({ ...f, deal_until: e.target.value })} /></div>
            <div><Label>{ui.discount}</Label><Input maxLength={30} value={f.discount_text} onChange={(e) => setF({ ...f, discount_text: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={f.is_free} onChange={(e) => setF({ ...f, is_free: e.target.checked })} />{ui.free}</label>
          {!f.is_free && <div><Label>{ui.price}</Label><Input type="number" min={0} value={f.price_from} onChange={(e) => setF({ ...f, price_from: e.target.value })} /></div>}
          <div className="grid grid-cols-2 gap-2">
            <div><Label>{ui.phone}</Label><Input maxLength={30} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <div><Label>{ui.season}</Label><select value={f.season} onChange={(e) => setF({ ...f, season: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-muted border-2 border-border text-sm font-bold">
              <option value="">{ui.none}</option><option value="winter">{ui.winter}</option><option value="spring">{ui.spring}</option><option value="summer">{ui.summer}</option></select></div>
          </div>
          <Button className="w-full" onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}{ui.send}</Button>
        </div>
      )}
    </div>
  );
}
