import { useState } from "react";
import { X, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AuthModal from "./AuthModal";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  club: any;
  schedules: any[];
}

const BookingModal = ({ open, onClose, club, schedules }: BookingModalProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!date || !childName) {
      toast({ title: t("common.error"), description: t("booking.select_date"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: inserted, error } = await supabase.from("bookings").insert({
      club_id: club.id,
      user_id: user.id,
      booking_date: format(date, "yyyy-MM-dd"),
      child_name: childName,
      child_age: childAge ? parseInt(childAge) : null,
      phone,
      message,
      status: "pending",
    }).select("id").single();
    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      // Notify club owner via Telegram (fire-and-forget)
      if (inserted?.id) {
        supabase.functions.invoke("notify-owner-booking", {
          body: { booking_id: inserted.id },
        }).catch((e) => console.warn("notify-owner-booking failed", e));
      }
      toast({ title: t("booking.success") });
      onClose();
      setChildName("");
      setChildAge("");
      setPhone("");
      setDate(undefined);
      setMessage("");
    }
  };

  return (
    <>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
          <div className="px-6 pt-6 pb-8">
            <h2 className="text-lg font-black text-center">{t("booking.title")}</h2>
            <p className="text-xs text-muted-foreground text-center mt-1">{club.name_ru}</p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">{t("booking.child_name")}</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">{t("booking.child_age")}</label>
                  <input type="number" value={childAge} onChange={(e) => setChildAge(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">{t("booking.phone")}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7..."
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{t("booking.date")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full mt-1 px-4 py-3 rounded-xl bg-muted text-sm font-bold text-left flex items-center gap-2",
                      !date && "text-muted-foreground"
                    )}>
                      <CalendarIcon size={16} />
                      {date ? format(date, "dd.MM.yyyy") : t("booking.select_date")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">{t("booking.message")}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin" /> : t("booking.submit")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
