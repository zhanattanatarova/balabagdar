import { useState, useEffect, useRef } from "react";
import { X, Phone, ArrowRight, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import logo from "@/assets/balahub-logo.png";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const digits = () => phone.replace(/\D/g, "");

  const sendCode = async (): Promise<"sent" | "not_linked" | "error"> => {
    const { data, error } = await supabase.functions.invoke("send-code", {
      body: { phone: digits() },
    });
    if (error) throw error;
    if (data?.error === "telegram_not_linked") {
      setBotUrl(data?.bot_url || "https://t.me");
      return "not_linked";
    }
    if (data?.error) throw new Error(data.error);
    return "sent";
  };

  const handleSendCode = async () => {
    if (digits().length < 11) {
      toast({ title: "Ошибка", description: "Введите корректный номер", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await sendCode();
      setStep("code");
      if (result === "sent") {
        toast({ title: "Код отправлен ✅", description: "Проверьте Telegram" });
      } else {
        // not_linked — show code screen with bot link, start auto-retry
        toast({ title: "Откройте бота", description: "Отправьте контакт и код придёт автоматически" });
        startAutoRetry();
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message || "Не удалось отправить код", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startAutoRetry = () => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    setRetrying(true);
    retryTimerRef.current = setInterval(async () => {
      try {
        const result = await sendCode();
        if (result === "sent") {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          setRetrying(false);
          setBotUrl(null);
          toast({ title: "Код отправлен ✅", description: "Проверьте Telegram" });
        }
      } catch {
        // silent retry
      }
    }, 5000);
  };

  const handleManualRetry = async () => {
    setLoading(true);
    try {
      const result = await sendCode();
      if (result === "sent") {
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
        setRetrying(false);
        setBotUrl(null);
        toast({ title: "Код отправлен ✅", description: "Проверьте Telegram" });
      } else {
        toast({ title: "Пока не привязан", description: "Отправьте контакт боту и подождите", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 4) {
      toast({ title: "Ошибка", description: "Введите 4-значный код", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: { phone: digits(), code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      toast({
        title: data?.isNewUser ? "Добро пожаловать! 🎉" : "С возвращением! 👋",
        description: data?.isNewUser ? "Аккаунт создан" : "Вы вошли в аккаунт",
      });

      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
      onClose();
      setStep("phone");
      setCode("");
      setBotUrl(null);
      setRetrying(false);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message || "Неверный код", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <X size={16} className="text-muted-foreground" />
        </button>

        <div className="px-6 pt-6 pb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="BalaHub" className="w-16 h-16" />
          </div>

          {step === "phone" && (
            <>
              <h2 className="text-xl font-black text-center">Вход в BalaHub</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">Введите номер телефона</p>

              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Номер телефона</label>
                <div className="relative mt-1.5">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 777 123 4567"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-blue-sky">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">Код придёт в Telegram</p>
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Получить код <ArrowRight size={18} /></>}
                </button>
              </div>
            </>
          )}

          {step === "code" && (
            <>
              <h2 className="text-xl font-black text-center">Введите код</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">Код из Telegram для {phone}</p>

              {/* Bot link banner — shown only if not linked */}
              {botUrl && (
                <div className="mt-4 p-3 rounded-xl bg-accent/50 space-y-2">
                  <p className="text-xs font-bold text-foreground">
                    📱 Откройте бота, нажмите /start и отправьте контакт
                  </p>
                  <a
                    href={botUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm hover:brightness-105 transition-all"
                  >
                    <MessageCircle size={16} /> Открыть бота
                  </a>
                  <button
                    onClick={handleManualRetry}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-primary"
                  >
                    {retrying && <RefreshCw size={12} className="animate-spin" />}
                    {retrying ? "Ожидаю привязку…" : "Повторить"}
                  </button>
                </div>
              )}

              <div className="mt-4">
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={code[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newCode = code.split("");
                        newCode[i] = val;
                        setCode(newCode.join(""));
                        if (val && i < 3) {
                          const next = e.target.nextElementSibling as HTMLInputElement;
                          next?.focus();
                        }
                      }}
                      className="w-14 h-14 text-center text-2xl font-black rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading || !!botUrl}
                  className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Подтвердить"}
                </button>

                <button
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setBotUrl(null);
                    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
                    setRetrying(false);
                  }}
                  className="w-full mt-2 text-muted-foreground font-bold text-sm py-2"
                >
                  ← Изменить номер
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
