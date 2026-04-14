import { useState, useEffect, useRef } from "react";
import { X, Phone, ArrowRight, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import logo from "@/assets/balabagdar-logo.jpg";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import RoleSelector from "./RoleSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (retryTimerRef.current) clearInterval(retryTimerRef.current); };
  }, []);

  // After login, check if user needs role selection
  useEffect(() => {
    if (user && !role && open) {
      setShowRoleSelector(true);
    }
  }, [user, role, open]);

  if (!open) return null;

  if (showRoleSelector) {
    return <RoleSelector onComplete={() => { setShowRoleSelector(false); onClose(); }} />;
  }

  const digits = () => phone.replace(/\D/g, "");

  const sendCode = async (): Promise<"sent" | "not_linked" | "error"> => {
    const { data, error } = await supabase.functions.invoke("send-code", { body: { phone: digits() } });
    if (error) throw error;
    if (data?.error === "telegram_not_linked") { setBotUrl(data?.bot_url || "https://t.me"); return "not_linked"; }
    if (data?.error) throw new Error(data.error);
    return "sent";
  };

  const handleSendCode = async () => {
    if (digits().length < 11) {
      toast({ title: t("common.error"), description: t("auth.enter_phone"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await sendCode();
      setStep("code");
      if (result === "sent") {
        toast({ title: t("auth.code_sent"), description: t("auth.check_telegram") });
      } else {
        toast({ title: t("auth.open_bot"), description: "" });
        startAutoRetry();
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const startAutoRetry = () => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    setRetrying(true);
    retryTimerRef.current = setInterval(async () => {
      try {
        const result = await sendCode();
        if (result === "sent") {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          setRetrying(false); setBotUrl(null);
          toast({ title: t("auth.code_sent"), description: t("auth.check_telegram") });
        }
      } catch {}
    }, 5000);
  };

  const handleManualRetry = async () => {
    setLoading(true);
    try {
      const result = await sendCode();
      if (result === "sent") {
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
        setRetrying(false); setBotUrl(null);
        toast({ title: t("auth.code_sent"), description: t("auth.check_telegram") });
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length < 4) {
      toast({ title: t("common.error"), description: t("auth.enter_code"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-code", { body: { phone: digits(), code } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.session) {
        await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      }
      // Don't close yet — role selection may happen via useEffect
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
      setStep("phone"); setCode(""); setBotUrl(null); setRetrying(false);
      // If user already has a role, close. Otherwise useEffect will show role selector.
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="px-6 pt-6 pb-8">
          <div className="flex justify-center mb-4"><img src={logo} alt="BalaBagdar" className="w-16 h-16" /></div>

          {step === "phone" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.title")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{t("auth.enter_phone")}</p>
              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("auth.phone_label")}</label>
                <div className="relative mt-1.5">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("auth.phone_placeholder")}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-blue-sky">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">{t("auth.code_via_telegram")}</p>
                </div>
                <button onClick={handleSendCode} disabled={loading}
                  className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t("auth.get_code")} <ArrowRight size={18} /></>}
                </button>
              </div>
            </>
          )}

          {step === "code" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.enter_code")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{phone}</p>
              {botUrl && (
                <div className="mt-4 p-3 rounded-xl bg-accent/50 space-y-2">
                  <p className="text-xs font-bold">📱 {t("auth.open_bot")}</p>
                  <a href={botUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm">
                    <MessageCircle size={16} /> {t("auth.open_bot")}
                  </a>
                  <button onClick={handleManualRetry} disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-primary">
                    {retrying && <RefreshCw size={12} className="animate-spin" />}
                    {retrying ? t("auth.waiting") : t("auth.retry")}
                  </button>
                </div>
              )}
              <div className="mt-4">
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input key={i} type="text" maxLength={1} value={code[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newCode = code.split(""); newCode[i] = val; setCode(newCode.join(""));
                        if (val && i < 3) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }}
                      className="w-14 h-14 text-center text-2xl font-black rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary" />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading || !!botUrl}
                  className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : t("auth.confirm")}
                </button>
                <button onClick={() => { setStep("phone"); setCode(""); setBotUrl(null); if (retryTimerRef.current) clearInterval(retryTimerRef.current); setRetrying(false); }}
                  className="w-full mt-2 text-muted-foreground font-bold text-sm py-2">
                  {t("auth.change_number")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
