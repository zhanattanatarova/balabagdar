import { useEffect, useState } from "react";
import { Plus, Loader2, Calendar as CalendarIcon, MapPin, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";

interface EventItem {
  id: string;
  title: string;
  body: string;
  name: string;
  phone?: string;
  city: string;
  event_date: string | null;
  created_at: string;
}

const NewsPage = ({ city }: { city: string }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const titleLines = t("news.title").split("\n");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    name: "",
    phone: "",
    event_date: "",
    period: "week" as "week" | "month",
  });

  const load = async () => {
    setLoading(true);
    const source = user ? "announcements" : "announcements_public";
    const { data } = await supabase
      .from(source as any)
      .select("id,title,body,name,phone,city,event_date,created_at")
      .eq("category", "event")
      .gt("expires_at", new Date().toISOString())
      .order("event_date", { ascending: true, nullsFirst: false });
    const list = ((data as any[]) || []).filter((e) => !city || e.city === city);
    setEvents(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, city]);

  const openPostForm = () => {
    if (!user) { setAuthOpen(true); return; }
    setOpen(true);
  };

  const submit = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Заполните название и описание", variant: "destructive" });
      return;
    }
    if (!form.event_date) {
      toast({ title: "Укажите дату события", variant: "destructive" });
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
      event_date: new Date(form.event_date).toISOString(),
      expires_at: expires,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: "Не удалось опубликовать", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Опубликовано!", description: "Событие появится в ленте города." });
    setForm({ title: "", body: "", name: "", phone: "", event_date: "", period: "week" });
    setOpen(false);
    load();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
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
      </div>

      {/* Events list */}
      <div className="px-4 mt-5">
        {loading && (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        )}
        {!loading && events.length === 0 && (
          <div className="cartoon-card flex flex-col items-center justify-center text-center py-14 px-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-black text-lg">Пока нет событий в {city}</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              Будьте первым — расскажите о своём событии!
            </p>
            <button
              onClick={openPostForm}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground font-black text-sm px-6 py-3 rounded-full shadow-md"
            >
              <Plus size={16} /> Добавить событие
            </button>
          </div>
        )}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e, i) => (
              <div
                key={e.id}
                className="cartoon-card p-4 animate-slide-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
              >
                {e.event_date && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-primary mb-2">
                    <CalendarIcon size={14} /> {formatDate(e.event_date)}
                  </div>
                )}
                <h3 className="font-black text-base leading-snug">{e.title}</h3>
                <p className="text-sm mt-2 whitespace-pre-line font-medium line-clamp-4">{e.body}</p>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} /> {e.city}
                  </span>
                  {e.phone && (
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-xs font-black text-primary">
                      <Phone size={12} /> {e.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Опубликовать событие в {city}</DialogTitle>
            <DialogDescription>
              Расскажите, что и когда будет в городе.
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
              <Label>Дата и время события *</Label>
              <Input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Описание *</Label>
              <Textarea
                value={form.body}
                maxLength={1500}
                rows={4}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Где, для кого, цена, программа..."
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
