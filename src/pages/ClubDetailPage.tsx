import ClubUpcomingEvents from "@/components/events/ClubUpcomingEvents";
import ClubDeals from "@/components/events/ClubDeals";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import BookingModal from "@/components/BookingModal";
import { telHref, waNumber, isMobilePhone } from "@/lib/phone";
import ClubReviews from "@/components/ClubReviews";
import SEO from "@/components/SEO";
import { safeImageUrl } from "@/lib/safeUrl";
import { clubAge, clubCategoryLabels, clubLocation, clubPrice, hasRealAge } from "@/lib/clubDisplay";
import ClubInitialAvatar from "@/components/ClubInitialAvatar";
import TwoGisBadge from "@/components/TwoGisBadge";

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, tField, lang } = useLanguage();
  const { user } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const viewedClubId = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (viewedClubId.current !== id) {
      viewedClubId.current = id;
      void supabase.rpc("increment_club_views", { _club_id: id });
      const key = `club_viewed:${id}`;
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          void supabase.rpc("log_club_event", { _club_id: id, _event_type: "view" });
        }
      } catch { /* storage unavailable */ }
    }
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
        <button onClick={() => navigate("/clubs")} className="text-primary font-bold">{t("common.back")}</button>
      </div>
    );
  }

  const contactWa = waNumber(club.whatsapp) || (isMobilePhone(club.phone) ? waNumber(club.phone) : null);
  const name = tField(club.name_ru, club.name_kz, club.name_en);
  const description = tField(club.description_ru, club.description_kz, club.description_en);
  const categoryLabels = clubCategoryLabels(club.categories, t);
  const mainCategory = categoryLabels[0]?.label || "";
  const seoTitle = lang === "en"
    ? `${name}${mainCategory ? ` — ${mainCategory}` : ""} in ${club.city} | BalaHub`
    : lang === "kz"
      ? `${name}${mainCategory ? ` — ${mainCategory}` : ""}, ${club.city} | BalaHub`
      : `${name}${mainCategory ? ` — ${mainCategory}` : ""} в ${club.city} | BalaHub`;
  const plainDescription = (description || "").replace(/\s+/g, " ").trim();
  const ageText = hasRealAge(club.age_min, club.age_max) ? clubAge(club.age_min, club.age_max, lang) : "";
  const placeText = clubLocation(club.city, club.address);
  const generatedDescription = lang === "en"
    ? [`${name}${mainCategory ? ` — ${mainCategory.toLowerCase()} for kids` : " — kids' club"}`, placeText && `Address: ${placeText}`, ageText && `Age: ${ageText}`].filter(Boolean).join(". ")
    : lang === "kz"
      ? [`${name}${mainCategory ? ` — балаларға арналған ${mainCategory.toLowerCase()}` : " — балалар үйірмесі"}`, placeText && `Мекенжайы: ${placeText}`, ageText && `Жасы: ${ageText}`].filter(Boolean).join(". ")
      : [`${name}${mainCategory ? ` — ${mainCategory.toLowerCase()} для детей` : " — детский кружок"}`, placeText && `Адрес: ${placeText}`, ageText && `Возраст: ${ageText}`].filter(Boolean).join(". ");
  const seoDescription = (plainDescription || `${generatedDescription}.`).slice(0, 160);
  const allCategoryLabels = clubCategoryLabels(club.categories, t, 100);
  const days = ["day.0", "day.1", "day.2", "day.3", "day.4", "day.5", "day.6"] as const;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={`/club/${club.id}`}
        image={safeImageUrl(club.avatar_url) || undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name,
          address: { "@type": "PostalAddress", addressLocality: club.city, streetAddress: club.address, addressCountry: "KZ" },
          telephone: club.phone,
          image: safeImageUrl(club.avatar_url) || undefined,
          aggregateRating: club.reviews_count > 0 ? { "@type": "AggregateRating", ratingValue: club.rating, reviewCount: club.reviews_count || 0 } : undefined,
        }}
      />
      <BookingModal open={showBooking} onClose={() => setShowBooking(false)} club={club} schedules={schedules} />

      {/* Header image */}
      <div className="relative h-56 bg-muted">
        {safeImageUrl(club.avatar_url) ? (
          <img src={safeImageUrl(club.avatar_url)} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <ClubInitialAvatar name={name} size="lg" />
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
          {club.reviews_count > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-secondary fill-secondary" />
                <span className="text-sm font-black">{club.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold">{club.reviews_count} {t("club.reviews")}</span>
            </div>
          )}
          {club.twogis_rating != null && (
            <div className="mt-1.5">
              <TwoGisBadge rating={club.twogis_rating} count={club.twogis_reviews_count} url={club.twogis_url} size="md" />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-bold">
            <MapPin size={12} className="text-primary" /> {clubLocation(club.city, club.address)}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {clubAge(club.age_min, club.age_max, lang) && (
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                {clubAge(club.age_min, club.age_max, lang)}
              </span>
            )}
            {club.price_from > 0 && (
              <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded-lg">
                {clubPrice(club.price_from, club.price_currency, lang)}
              </span>
            )}
            {categoryLabels.map((category) => (
              <span key={category.id} className="text-xs font-bold bg-muted px-2 py-1 rounded-lg">
                {category.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Primary actions */}
      <div className="px-4 mt-4 space-y-2">
        {(() => {
          const wa = waNumber(club.whatsapp) || (isMobilePhone(club.phone) ? waNumber(club.phone) : null);
          const msg = lang === "kz"
            ? "Сәлеметсіз бе! Сізді BalaHub-тан таптым. Балаға арналған сабақтар туралы білгім келеді."
            : lang === "en"
            ? "Hello! I found you on BalaHub. I'd like to learn about classes for my child."
            : "Здравствуйте! Нашла вас на BalaHub. Хочу узнать про занятия для ребёнка.";
          const cls = "w-full bg-primary text-primary-foreground font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all";
          if (wa) return (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className={cls}>
              <MessageCircle size={20} /> {lang === "kz" ? "WhatsApp-қа жазу" : lang === "en" ? "Message on WhatsApp" : "Написать в WhatsApp"}
            </a>
          );
          if (telHref(club.phone)) return (
            <a href={telHref(club.phone)!} className={cls}>
              <Phone size={20} /> {t("club.call")}
            </a>
          );
          return null;
        })()}
        {schedules.length > 0 && (
          <button
            onClick={() => setShowBooking(true)}
            className="w-full bg-muted text-foreground font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Calendar size={16} /> {t("club.book")}
          </button>
        )}
      </div>

      {/* Contacts */}
      <div className="px-4 mt-4">
        <h2 className="font-black text-sm mb-2">{t("club.contacts")}</h2>
        <div className="flex gap-2">
          {telHref(club.phone) && (
            <a href={telHref(club.phone)!} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted font-bold text-sm">
              <Phone size={16} className="text-primary" /> {t("club.call")}
            </a>
          )}
          {contactWa && (
            <a href={`https://wa.me/${contactWa}`} target="_blank" rel="noopener noreferrer"
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
          {club.instagram && (() => {
            const raw = club.instagram.trim();
            const href = /^https?:\/\//i.test(raw)
              ? raw
              : `https://instagram.com/${raw.replace(/^@/, "").replace(/^instagram\.com\//i, "")}`;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-soft font-bold text-sm">
                📸 Instagram
              </a>
            );
          })()}
        </div>
      </div>

      {/* Categories / sections offered */}
      {allCategoryLabels.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-black text-sm mb-2">{t("club.directions")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {allCategoryLabels.map((category) => (
              <span key={category.id} className="px-2.5 py-1 rounded-full bg-primary/15 border-2 border-primary/40 text-[11px] font-bold text-foreground">
                {category.label}
              </span>
            ))}
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

      <ClubUpcomingEvents clubId={club.id} />
      <ClubDeals clubId={club.id} />

      {/* Reviews */}
      <ClubReviews clubId={club.id} />
    </div>
  );
};

export default ClubDetailPage;
