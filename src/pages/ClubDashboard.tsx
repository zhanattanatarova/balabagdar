import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Calendar as CalendarIcon, Inbox, Settings, Loader2, Check, X as XIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const ClubDashboard = () => {
  const { user } = useAuth();
  const { t, tField } = useLanguage();
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookings" | "calendar" | "settings">("bookings");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: clubs } = await supabase.from("clubs").select("*").eq("user_id", user.id).limit(1);
      const myClub = clubs?.[0] || null;
      setClub(myClub);

      if (myClub) {
        const { data: bk } = await supabase
          .from("bookings")
          .select("*")
          .eq("club_id", myClub.id)
          .order("created_at", { ascending: false });
        setBookings(bk || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      toast({ title: status === "confirmed" ? t("dashboard.confirmed") : t("dashboard.rejected") });
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
        <button
          onClick={() => navigate("/club/edit")}
          className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={18} /> {t("dashboard.create_club")}
        </button>
      </div>
    );
  }

  const name = tField(club.name_ru, club.name_kz, club.name_en);
  const statusColors: Record<string, string> = {
    pending: "bg-secondary/10 text-secondary",
    confirmed: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="pt-6 pb-4 px-4 rounded-b-3xl" style={{ background: "var(--gradient-header)" }}>
        <h1 className="text-lg font-black text-primary-foreground">{t("dashboard.my_club")}</h1>
        <p className="text-sm text-primary-foreground/70 font-bold">{name}</p>
        <button
          onClick={() => navigate("/club/edit")}
          className="mt-3 flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground font-bold text-sm px-4 py-2 rounded-xl"
        >
          <Edit size={14} /> {t("dashboard.edit_profile")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-4">
        {(["bookings", "calendar", "settings"] as const).map((tabId) => {
          const icons = { bookings: Inbox, calendar: CalendarIcon, settings: Settings };
          const Icon = icons[tabId];
          return (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === tabId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon size={14} /> {t(`dashboard.${tabId}` as any)}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {tab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">📭</span>
                <p className="text-sm text-muted-foreground font-bold mt-2">{t("home.not_found")}</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="cartoon-card p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-sm">{b.child_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-0.5">
                        {b.booking_date} · {b.child_age ? `${b.child_age} лет` : ""} · {b.phone}
                      </p>
                      {b.message && <p className="text-xs text-muted-foreground mt-1">{b.message}</p>}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusColors[b.status] || ""}`}>
                      {t(`dashboard.${b.status}` as any)}
                    </span>
                  </div>
                  {b.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateBookingStatus(b.id, "confirmed")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs"
                      >
                        <Check size={14} /> {t("dashboard.confirmed")}
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b.id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-destructive/10 text-destructive font-bold text-xs"
                      >
                        <XIcon size={14} /> {t("dashboard.rejected")}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
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
                  {t("dashboard.bookings")} {selectedDate.toLocaleDateString()}:
                </p>
                {bookings.filter((b) => b.booking_date === selectedDate.toISOString().split("T")[0]).length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">{t("home.not_found")}</p>
                ) : (
                  bookings
                    .filter((b) => b.booking_date === selectedDate.toISOString().split("T")[0])
                    .map((b) => (
                      <div key={b.id} className="flex items-center gap-2 mt-2">
                        <Clock size={12} className="text-primary" />
                        <span className="text-sm font-bold">{b.child_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColors[b.status] || ""}`}>
                          {t(`dashboard.${b.status}` as any)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="cartoon-card p-4 space-y-4">
            <div>
              <p className="text-sm font-black">{t("dashboard.settings")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("profile.free_access")}</p>
            </div>
            <button
              onClick={() => navigate("/club/edit")}
              className="w-full py-3 rounded-xl bg-muted text-sm font-bold flex items-center justify-center gap-2"
            >
              <Edit size={14} /> {t("dashboard.edit_profile")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard;
