import { useState, useEffect } from "react";
import { Heart, Clock, Bell, ChevronRight, LogOut, LogIn, MessageCircle, Building2, Shield, ExternalLink, X, Edit2, Check, Phone, BookOpen, Loader2, UserCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { api } from "@/lib/api";

const SUPPORT_TELEGRAM = "https://t.me/balabagdar_support";
const SUPPORT_WHATSAPP = "https://wa.me/77001234567";

const ContactModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-2xl animate-slide-up border-t-[4px] border-x-[4px] border-primary p-5 pb-8">
        <div className="flex justify-center mb-3"><div className="w-12 h-1.5 rounded-full bg-primary" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">{t("contact.title")}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
            <X size={16} className="text-destructive" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground font-bold mb-4">{t("contact.desc")}</p>
        <div className="flex flex-col gap-3">
          <a href={SUPPORT_TELEGRAM} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{t("contact.telegram")}</p>
              <p className="text-xs text-muted-foreground font-bold">@balabagdar_support</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground" />
          </a>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border-2 border-green-200 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">{t("contact.whatsapp")}</p>
              <p className="text-xs text-muted-foreground font-bold">+7 700 123 4567</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = {
  pending: "На рассмотрении",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
};

const ProfilePage = () => {
  const { user, signOut, setUserFromLogin, reload } = useAuth();
  const { t, tField } = useLanguage();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName((user as any).firstName || "");
      setLastName((user as any).lastName || "");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && role === "parent") {
      setLoadingBookings(true);
      api.bookings.mine()
        .then(setBookings)
        .catch(() => {})
        .finally(() => setLoadingBookings(false));
    }
  }, [user?.id, role]);

  const handleSaveName = async () => {
    if (!firstName.trim() && !lastName.trim()) return;
    setSavingName(true);
    try {
      const result = await api.auth.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setUserFromLogin(result.user, localStorage.getItem("balahub_token")!);
      setEditingName(false);
      toast({ title: "Имя сохранено ✅" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const phone = (user as any)?.phone || "";
  const displayName = (user as any)?.displayName;
  const initials = [firstName, lastName].filter(Boolean).map(s => s[0]).join("").toUpperCase() || phone.slice(-2);

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <ContactModal open={showContact} onClose={() => setShowContact(false)} />

      <div className="pt-8 pb-12 flex flex-col items-center rounded-b-[2rem] relative" style={{ background: "var(--gradient-header)" }}>
        <div className="w-20 h-20 rounded-full bg-primary-foreground/20 border-4 border-primary-foreground/40 flex items-center justify-center text-2xl font-black text-primary-foreground">
          {initials || <UserCircle2 size={36} className="text-primary-foreground/60" />}
        </div>

        {user ? (
          <>
            {editingName ? (
              <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-xs px-4">
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Имя"
                  className="w-full px-4 py-2.5 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Фамилия"
                  className="w-full px-4 py-2.5 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                />
                <div className="flex gap-2 w-full">
                  <button onClick={() => setEditingName(false)}
                    className="flex-1 py-2 rounded-xl bg-primary-foreground/10 text-primary-foreground font-bold text-sm">
                    Отмена
                  </button>
                  <button onClick={handleSaveName} disabled={savingName}
                    className="flex-1 py-2 rounded-xl bg-primary-foreground/30 text-primary-foreground font-bold text-sm flex items-center justify-center gap-1">
                    {savingName ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Сохранить</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-primary-foreground">
                    {displayName || "Укажите имя"}
                  </h1>
                  <button onClick={() => setEditingName(true)}
                    className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Edit2 size={13} className="text-primary-foreground" />
                  </button>
                </div>
                <p className="text-primary-foreground/70 text-xs font-bold mt-0.5 flex items-center gap-1">
                  <Phone size={11} /> {phone || "—"}
                </p>
                {role && (
                  <span className="mt-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-[11px] font-bold">
                    {role === "parent" ? "👨‍👩‍👧 Родитель" : "🏫 Кружок"}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-primary-foreground mt-3">{t("profile.guest")}</h1>
            <p className="text-primary-foreground/70 text-xs font-bold mt-0.5">{t("profile.guest_desc")}</p>
          </>
        )}
      </div>

      <div className="px-4 -mt-5 relative z-10 space-y-4">
        {!user && (
          <button onClick={() => setShowAuth(true)}
            className="w-full flex items-center gap-3 bg-primary rounded-2xl p-3.5 text-left cartoon-card border-primary">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <LogIn size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-primary-foreground">{t("profile.login")}</p>
              <p className="text-[10px] text-primary-foreground/60 font-bold">{t("profile.login_desc")}</p>
            </div>
            <ChevronRight size={16} className="text-primary-foreground shrink-0" />
          </button>
        )}

        {user && role === "club_owner" && (
          <button onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 bg-secondary rounded-2xl p-3.5 text-left cartoon-card border-secondary">
            <div className="w-10 h-10 rounded-xl bg-secondary-foreground/20 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-secondary-foreground">{t("dashboard.my_club")}</p>
              <p className="text-[10px] text-secondary-foreground/60 font-bold">{t("dashboard.edit_profile")}</p>
            </div>
            <ChevronRight size={16} className="text-secondary-foreground shrink-0" />
          </button>
        )}

        {user && role === "parent" && (
          <div>
            <h3 className="text-sm font-black mb-2 px-1 flex items-center gap-2">
              <BookOpen size={15} className="text-primary" /> Мои кружки
            </h3>
            <div className="cartoon-card overflow-hidden">
              {loadingBookings ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <span className="text-3xl">🎯</span>
                  <p className="text-sm text-muted-foreground font-bold mt-2">Вы ещё не записались ни в один кружок</p>
                  <button onClick={() => navigate("/")}
                    className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl">
                    Найти кружок
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {bookings.map(b => {
                    const clubName = b.clubNameRu || b.clubNameKz || b.clubNameEn || "Кружок";
                    return (
                      <button key={b.id} onClick={() => navigate(`/club/${b.clubId}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
                        <div className="w-11 h-11 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                          {b.clubAvatarUrl
                            ? <img src={b.clubAvatarUrl} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xl">🏫</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">{clubName}</p>
                          <p className="text-xs text-muted-foreground font-bold">
                            {b.childName && `${b.childName} · `}{b.bookingDate}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${statusColors[b.status] || ""}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-black mb-2 px-1">{t("profile.menu")}</h3>
          <div className="cartoon-card p-1">
            {[
              { icon: Heart, label: t("profile.favorites"), color: "bg-destructive/10", iconColor: "text-destructive", action: () => toast({ title: t("profile.favorites") }) },
              { icon: Clock, label: t("profile.history"), color: "bg-secondary/10", iconColor: "text-secondary", action: () => toast({ title: t("profile.history") }) },
              { icon: Bell, label: t("profile.notifications"), color: "bg-primary/10", iconColor: "text-primary", action: () => navigate("/notifications") },
            ].map((item) => (
              <button key={item.label} onClick={item.action}
                className="flex items-center gap-3 p-3 text-left w-full hover:bg-muted/50 rounded-xl transition-colors">
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} className={item.iconColor} />
                </div>
                <span className="flex-1 font-bold text-sm">{item.label}</span>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black mb-2 px-1">{t("profile.settings")}</h3>
          <div className="cartoon-card p-1">
            {[
              { icon: MessageCircle, label: t("profile.contact_us"), color: "bg-primary/10", iconColor: "text-primary", action: () => setShowContact(true) },
              { icon: Shield, label: t("profile.legal"), color: "bg-amber-100", iconColor: "text-amber-600", action: () => navigate("/legal") },
            ].map((item) => (
              <button key={item.label} onClick={item.action}
                className="flex items-center gap-3 p-3 text-left w-full hover:bg-muted/50 rounded-xl transition-colors">
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} className={item.iconColor} />
                </div>
                <span className="flex-1 font-bold text-sm">{item.label}</span>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {user && (
          <button onClick={async () => { await signOut(); toast({ title: t("common.logged_out"), description: t("common.bye") }); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-destructive/30 text-destructive font-bold text-sm active:scale-[0.97] transition-transform bg-destructive/5">
            <LogOut size={14} />{t("profile.logout")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
