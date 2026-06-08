import { useState } from "react";
import { Star, ChevronRight, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import newsArt from "@/assets/news-art.jpg";
import newsFestival from "@/assets/news-festival.jpg";
import newsShow from "@/assets/news-show.jpg";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/i18n/translations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";

const events: { titleKey: TranslationKey; dateKey: TranslationKey; rating: number; img: string }[] = [
  { titleKey: "news.event1_title", dateKey: "news.date1", rating: 4.8, img: newsArt },
  { titleKey: "news.event2_title", dateKey: "news.date2", rating: 4.7, img: newsFestival },
  { titleKey: "news.event3_title", dateKey: "news.date3", rating: 4.5, img: newsShow },
];

const NewsPage = ({ city }: { city: string }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const titleLines = t("news.title").split("\n");

  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    name: "",
    phone: "",
    period: "week" as "week" | "month",
  });

  const openPostForm = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setOpen(true);
  };

  const submit = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Заполните название и описание", variant: "destructive" });
      return;
    }
    if (form.title.length > 120 || form.body.length > 1500) {
      toast({ title: "Слишком длинный текст", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const days = form.period === "week" ? 7 : 30;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("announcements").insert({
      user_id: user.id,
      category: "event",
      title: form.title.trim(),
      body: form.body.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      city,
      expires_at: expires,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Не удалось опубликовать", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Опубликовано!", description: "Событие появится в ленте города." });
    setForm({ title: "", body: "", name: "", phone: "", period: "week" });
    setOpen(false);
  };

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      {/* Header banner */}
      <div className="relative h-44 rounded-b-3xl overflow-hidden" style={{ background: "var(--gradient-header)" }}>
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrandLogo size="xs" />
              <span className="text-primary-foreground/80 text-xs font-bold">{t("news.today_in")} {city}</span>
            </div>
            <h1 className="text-xl font-black text-primary-foreground leading-snug">
              {titleLines.map((line, i) => (
                <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
              ))}
            </h1>
          </div>
          <button
            onClick={openPostForm}
            aria-label="Добавить событие"
            title="Добавить событие в городе"
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} className="text-primary-foreground" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30" style={{
          background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 60\"><path d=\"M0 40 Q50 10 100 35 Q150 60 200 30 Q250 5 300 35 Q350 55 400 25 L400 60 L0 60Z\" fill=\"white\"/></svg>') no-repeat bottom",
          backgroundSize: "cover"
        }} />
      </div>

      {/* Events list */}
      <div className="px-4 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => {
          const title = t(event.titleKey);
          const date = t(event.dateKey);
          return (
            <div
              key={event.titleKey}
              onClick={() => toast({ title, description: `${date} · ⭐ ${event.rating}` })}
              className="cartoon-card overflow-hidden cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
            >
              <div className="relative h-40">
                <img src={event.img} alt={title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5">
                <h3 className="font-black text-sm leading-snug">{title}</h3>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} className={s <= Math.floor(event.rating) ? "text-secondary fill-secondary" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground font-bold">{date}</span>
                  <button className="bg-primary text-primary-foreground text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1">
                    {t("news.more")} <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Опубликовать событие в {city}</DialogTitle>
            <DialogDescription>
              Расскажите, что будет в городе на этой неделе или месяце.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Название события *</Label>
              <Input
                value={form.title}
                maxLength={120}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Например: Детский фестиваль науки"
              />
            </div>
            <div>
              <Label>Описание *</Label>
              <Textarea
                value={form.body}
                maxLength={1500}
                rows={4}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Когда, где, для кого, цена, программа..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Имя организатора</Label>
                <Input
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Центр / контакт"
                />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input
                  value={form.phone}
                  maxLength={30}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7..."
                />
              </div>
            </div>
            <div>
              <Label>Период публикации</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, period: "week" })}
                  className={`flex-1 py-2 rounded-md border-2 font-bold text-sm ${form.period === "week" ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
                >
                  Неделя
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, period: "month" })}
                  className={`flex-1 py-2 rounded-md border-2 font-bold text-sm ${form.period === "month" ? "bg-primary text-primary-foreground border-primary" : "border-input"}`}
                >
                  Месяц
                </button>
              </div>
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full">
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Опубликовать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsPage;
