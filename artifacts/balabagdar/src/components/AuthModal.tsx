import { useState, useEffect } from "react";
import { X, Phone, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useLanguage } from "@/hooks/useLanguage";
import RoleSelector from "./RoleSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const TELEGRAM_BOT = "balabagdar_bot";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { t } = useLanguage();
  const { user, setUserFromLogin } = useAuth();
  const { role } = useUserRole();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [channel, setChannel] = useState<"telegram" | "dev" | "none" | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [needsLink, setNeedsLink] = useState(false);

  useEffect(() => {
    if (user && !role && open) {
      setShowRoleSelector(true);
    }
  }, [user?.id, role, open]);

  if (!open) return null;

  if (showRoleSelector) {
    return <RoleSelector onComplete={() => { setShowRoleSelector(false); onClose(); }} />;
  }

  const digits = () => phone.replace(/\D/g, "");

  const handleSendCode = async () => {
    if (digits().length < 11) {
      toast({ title: t("common.error"), description: t("auth.enter_phone"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.sendCode(digits());
      const ch = (result as any).channel || null;
      const dl = (result as any).deepLink || null;
      setChannel(ch);
      setNeedsLink(!!(result as any).needsLink);
      setDeepLink(dl);
      setStep("code");
      if ((result as any).dev_code) {
        setDevCode((result as any).dev_code);
      } else if (ch === "telegram") {
        toast({ title: t("auth.code_sent"), description: t("auth.check_telegram") });
      } else if (ch === "none" && dl) {
        // Auto-open Telegram deep link — no button needed
        window.open(dl, "_blank");
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
      const result = await api.auth.verifyCode(digits(), code);
      setUserFromLogin(result.user, result.token);
      setStep("phone");
      setCode("");
      setDevCode(null);
      setChannel(null);
      if (!result.role) {
        setShowRoleSelector(true);
      } else {
        onClose();
      }
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
          <div className="flex justify-center mb-4"><BrandLogo size="md" /></div>

          {step === "phone" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.title")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{t("auth.enter_phone")}</p>
              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("auth.phone_label")}</label>
                <div className="relative mt-1.5">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("auth.phone_placeholder")}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-blue-sky">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">{t("auth.code_via_telegram")}</p>
                </div>
                <a
                  href={`https://t.me/${TELEGRAM_BOT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-2 py-2 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink size={13} />
                  Привязать Telegram к номеру → @{TELEGRAM_BOT}
                </a>
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-4 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t("auth.get_code")} <ArrowRight size={18} /></>}
                </button>
              </div>
            </>
          )}

          {step === "code" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.enter_code")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{phone}</p>

              {devCode && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-xs font-bold text-yellow-700">Тестовый код (только в разработке):</p>
                  <p className="text-2xl font-black tracking-widest text-primary mt-1">{devCode}</p>
                </div>
              )}

              {channel === "telegram" && !devCode && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-blue-sky">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">Код отправлен в ваш Telegram</p>
                </div>
              )}

              {channel === "none" && !devCode && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-blue-sky">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">
                    Открылся Telegram — бот пришлёт вам код. Вернитесь и введите его ниже.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const arr = code.split("");
                        arr[i] = val;
                        setCode(arr.join(""));
                        if (val && i < 3) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }}
                      className="w-14 h-14 text-center text-2xl font-black rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : t("auth.confirm")}
                </button>
                <button
                  onClick={() => { setStep("phone"); setCode(""); setDevCode(null); setChannel(null); setDeepLink(null); }}
                  className="w-full mt-2 text-muted-foreground font-bold text-sm py-2"
                >
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
