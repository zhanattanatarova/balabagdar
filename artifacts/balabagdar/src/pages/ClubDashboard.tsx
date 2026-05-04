import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit, Calendar as CalendarIcon, Inbox, Settings, Loader2,
  Check, X as XIcon, Clock, Phone, MessageCircle, Instagram,
  MapPin, ExternalLink, Star, Users, Image, Info
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = {
  pending: "Ожидание",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
};

const ClubDashboard = () => {
  const { user } = useAuth();
  const { t, tField } = useLanguage();
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookings" | "info" | "calendar" | "settings">("bookings");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const myClub = await api.clubs.my();
        setClub(myClub);
        if (myClub) {
          const bk = await api.bookings.myClub();
          setBookings(bk || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      toast({ title: status === "confirmed" ? "✅ Подтверждено" : "❌ Отклонено" });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <span className="text-5xl">🏫</span>
        <h2 className="text-lg font-black">{t("dashboard.no_club")}</h2>
        <p className="text-sm text-muted-foreground text-center">Создайте профиль вашего кружка, чтобы родители могли вас найти</p>
        <button
          onClick={() => navigate("/club/edit")}
          className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={18} /> {t("dashboard.create_club")}
        </button>
      </div>
    );
  }

  const name = tField(club.nameRu || club.name_ru, club.nameKz || club.name_kz, club.nameEn || club.name_en);
  const description = tField(club.descriptionRu || club.description_ru, club.descriptionKz || club.description_kz, club.descriptionEn || club.description_en);
  const phone = club.phone;
  const whatsapp = club.whatsapp;
  const telegram = club.telegram;
  const instagram = club.instagram;
  const gisUrl = club.gisUrl || club.gis_url;
  const avatarUrl = club.avatarUrl || club.avatar_url;
  const address = club.address;
  const city = club.city;
  const category = club.category;
  const ageMin = club.ageMin ?? club.age_min;
  const ageMax = club.ageMax ?? club.age_max;
  const priceFrom = club.priceFrom ?? club.price_from;
  const rating = club.rating;
  const gallery: string[] = club.gallery || [];

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const tabs = [
    { id: "bookings" as const, icon: Inbox, label: "Заявки", badge: pendingCount > 0 ? pendingCount : null },
    { id: "info" as const, icon: Info, label: "О кружке" },
    { id: "calendar" as const, icon: CalendarIcon, label: "Календарь" },
    { id: "settings" as const, icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="pt-6 pb-4 px-4 rounded-b-3xl" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-foreground/20 shrink-0 flex items-center justify-center">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-3xl">🏫</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-primary-foreground leading-tight">{name}</h1>
            <p className="text-xs text-primary-foreground/70 font-bold mt-0.5">
              {city}{address ? ` · ${address}` : ""}
            </p>
            {rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-yellow-300 fill-yellow-300" />
                <span className="text-xs font-black text-primary-foreground">{Number(rating).toFixed(1)}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/club/edit")}
            className="flex items-center gap-1.5 bg-primary-foreground/20 text-primary-foreground font-bold text-xs px-3 py-2 rounded-xl shrink-0"
          >
            <Edit size={13} /> Редактировать
          </button>
        </div>
      </div>

      <div className="flex gap-1 px-4 mt-4 overflow-x-auto pb-1">
        {tabs.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon size={13} />
            <span className="hidden xs:inline">{label}</span>
            {badge !== null && badge !== undefined && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-black flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">

        {tab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">📭</span>
                <p className="text-sm text-muted-foreground font-bold mt-2">Пока нет заявок</p>
                <p className="text-xs text-muted-foreground mt-1">Заявки от родителей появятся здесь</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="cartoon-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm">{b.childName || b.child_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-0.5">
                        {b.bookingDate || b.booking_date}
                        {(b.childAge || b.child_age) ? ` · ${b.childAge || b.child_age} лет` : ""}
                        {b.phone ? ` · ${b.phone}` : ""}
                      </p>
                      {b.message && <p className="text-xs text-muted-foreground mt-1 italic">«{b.message}»</p>}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${statusColors[b.status] || ""}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </div>
                  {b.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateBookingStatus(b.id, "confirmed")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-100 text-green-700 font-bold text-xs">
                        <Check size={13} /> Подтвердить
                      </button>
                      <button onClick={() => updateBookingStatus(b.id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-xs">
                        <XIcon size={13} /> Отклонить
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "info" && (
          <div className="space-y-4">
            {description && (
              <div className="cartoon-card p-4">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">📋 Описание</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{description}</p>
              </div>
            )}

            <div className="cartoon-card p-4 space-y-3">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">📞 Контакты</p>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted hover:bg-muted/70 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone size={15} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold">{phone}</span>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                    <MessageCircle size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-green-700">WhatsApp</span>
                  <ExternalLink size={13} className="text-green-500 ml-auto" />
                </a>
              )}
              {telegram && (
                <a href={`https://t.me/${telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <MessageCircle size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-700">Telegram {telegram}</span>
                  <ExternalLink size={13} className="text-blue-500 ml-auto" />
                </a>
              )}
              {instagram && (
                <a href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                    <Instagram size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-pink-700">Instagram {instagram}</span>
                  <ExternalLink size={13} className="text-pink-500 ml-auto" />
                </a>
              )}
              {gisUrl && (
                <a href={gisUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-emerald-700">2GIS</span>
                  <ExternalLink size={13} className="text-emerald-500 ml-auto" />
                </a>
              )}
              {!phone && !whatsapp && !telegram && !instagram && !gisUrl && (
                <p className="text-xs text-muted-foreground text-center py-2">Контакты не указаны. <button onClick={() => navigate("/club/edit")} className="text-primary font-bold">Добавить →</button></p>
              )}
            </div>

            <div className="cartoon-card p-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Возраст</p>
                <p className="text-sm font-black mt-0.5">{ageMin}–{ageMax} лет</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Цена от</p>
                <p className="text-sm font-black mt-0.5">{priceFrom ? `${priceFrom.toLocaleString()} ₸` : "—"}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground font-bold">Заявки</p>
                <p className="text-sm font-black mt-0.5">{bookings.length}</p>
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="cartoon-card p-4">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Image size={13} /> Галерея ({gallery.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.slice(0, 6).map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate(`/club/${club.id}`)}
              className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-2">
              <ExternalLink size={15} /> Посмотреть страницу кружка
            </button>
          </div>
        )}

        {tab === "calendar" && (
          <div className="cartoon-card p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("p-3 pointer-events-auto mx-auto")}
            />
            {selectedDate && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-xs font-bold text-muted-foreground">
                  Заявки на {selectedDate.toLocaleDateString("ru-RU")}:
                </p>
                {bookings.filter((b) => (b.bookingDate || b.booking_date) === selectedDate.toISOString().split("T")[0]).length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-2">Нет заявок на этот день</p>
                ) : (
                  bookings
                    .filter((b) => (b.bookingDate || b.booking_date) === selectedDate.toISOString().split("T")[0])
                    .map((b) => (
                      <div key={b.id} className="flex items-center gap-2 mt-2">
                        <Clock size={12} className="text-primary" />
                        <span className="text-sm font-bold">{b.childName || b.child_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColors[b.status] || ""}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <div className="cartoon-card p-4">
              <p className="text-sm font-black mb-3">⚙️ Управление</p>
              <button onClick={() => navigate("/club/edit")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 mb-2">
                <Edit size={15} /> Редактировать кружок
              </button>
              <button onClick={() => navigate(`/club/${club.id}`)}
                className="w-full py-3 rounded-xl bg-muted text-sm font-bold flex items-center justify-center gap-2">
                <ExternalLink size={15} /> Открыть страницу кружка
              </button>
            </div>
            <div className="cartoon-card p-4">
              <p className="text-sm font-black mb-2">📊 Статистика</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-primary">{bookings.length}</p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">Всего заявок</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-green-600">{bookings.filter(b => b.status === "confirmed").length}</p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">Подтверждено</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard;
