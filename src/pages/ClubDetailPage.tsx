import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import BookingModal from "@/components/BookingModal";
import ClubReviews from "@/components/ClubReviews";

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, tField } = useLanguage();
  const { user } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchClub = async () => {
      const { data } = await supabase.from("clubs").select("*").eq("id", id).single();
      setClub(data);

      const { data: sched } = await supabase
        .from("club_schedules")
        .select("*")
        .eq("club_id", id)
        .order("day_of_week");
      setSchedules(sched || []);
      setLoading(false);
    };
    fetchClub();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-lg font-bold">😕 {t("home.not_found")}</p>
        <button onClick={() => navigate("/")} className="text-primary font-bold">{t("common.back")}</button>
      </div>
    );
  }

  const name = tField(club.name_ru, club.name_kz, club.name_en);
  const description = tField(club.description_ru, club.description_kz, club.description_en);
  const days = ["day.0", "day.1", "day.2", "day.3", "day.4", "day.5", "day.6"] as const;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <BookingModal open={showBooking} onClose={() => setShowBooking(false)} club={club} schedules={schedules} />

      {/* Header image */}
      <div className="relative h-56 bg-muted">
        {club.avatar_url ? (
          <img src={club.avatar_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-5xl">🏫</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="cartoon-card p-4">
          <h1 className="text-xl font-black">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-secondary fill-secondary" />
              <span className="text-sm font-black">{club.rating || "—"}</span>
            </div>
            <span className="text-xs text-muted-foreground font-bold">{club.reviews_count} {t("club.reviews")}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-bold">
            <MapPin size={12} className="text-primary" /> {club.city}, {club.address}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
              {t("club.age")}: {club.age_min}–{club.age_max}
            </span>
            <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded-lg">
              {t("club.price")} {club.price_from?.toLocaleString()} {club.price_currency}
            </span>
          </div>
        </div>
      </div>

      {/* Book button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowBooking(true)}
          className="w-full bg-primary text-primary-foreground font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <Calendar size={18} /> {t("club.book")}
        </button>
      </div>

      {/* Contacts */}
      <div className="px-4 mt-4">
        <h2 className="font-black text-sm mb-2">{t("club.contacts")}</h2>
        <div className="flex gap-2">
          {club.phone && (
            <a href={`tel:${club.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted font-bold text-sm">
              <Phone size={16} className="text-primary" /> {t("club.call")}
            </a>
          )}
          {club.whatsapp && (
            <a href={`https://wa.me/${club.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-light font-bold text-sm">
              <MessageCircle size={16} className="text-primary" /> {t("club.whatsapp")}
            </a>
          )}
          {club.telegram && (
            <a href={`https://t.me/${club.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-sky font-bold text-sm">
              <MessageCircle size={16} /> {t("club.telegram_link")}
            </a>
          )}
          {club.instagram && (
            <a href={`https://instagram.com/${club.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-soft font-bold text-sm">
              📸 Instagram
            </a>
          )}
        </div>
      </div>

      {/* Categories / sections offered */}
      {Array.isArray(club.categories) && club.categories.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-black text-sm mb-2">Направления</h2>
          <div className="flex flex-wrap gap-1.5">
            {club.categories.map((id: string) => {
              const key = id.includes(".") ? id : `cat.${id}`;
              const label = t(key as any);
              return (
                <span key={id} className="px-2.5 py-1 rounded-full bg-primary/15 border-2 border-primary/40 text-[11px] font-bold text-foreground">
                  {label === key ? id : label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* About */}
      {description && (
        <div className="px-4 mt-4">
          <h2 className="font-black text-sm mb-2">{t("club.about")}</h2>
          <div className="cartoon-card p-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        </div>
      )}

      {/* Schedule */}
      {schedules.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-black text-sm mb-2">{t("club.schedule")}</h2>
          <div className="cartoon-card p-3 space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-sm font-bold">{t(days[s.day_of_week])}</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={12} />
                  <span className="font-bold">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {club.gallery && club.gallery.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-black text-sm mb-2">{t("club.gallery")}</h2>
          <div className="grid grid-cols-3 gap-2">
            {club.gallery.map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="rounded-xl aspect-square object-cover w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ClubReviews clubId={club.id} />
    </div>
  );
};

export default ClubDetailPage;
