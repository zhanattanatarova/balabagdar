import { useState } from "react";
import { X, Phone, ArrowRight, Loader2, MessageCircle, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useLanguage } from "@/hooks/useLanguage";
import RoleSelector from "./RoleSelector";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const TELEGRAM_BOT = "balabagdar_bot";

// phone → code → name (новые) → [RoleSelector]
// email (альтернатива)
type Step = "phone" | "code" | "name" | "email";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { t } = useLanguage();
  const { setUserFromLogin } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [noTelegram, setNoTelegram] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  if (!open) return null;
  if (showRoleSelector) {
    return <RoleSelector onComplete={() => { setShowRoleSelector(false); onClose(); }} />;
  }

  const digits = () => phone.replace(/\D/g, "");

  const handlePhoneInput = (val: string) => {
    // Всегда начинаем с +7
    if (!val.startsWith("+7")) {
      setPhone("+7");
      return;
    }
    // Только цифры после +7, не более 10 цифр (итого 11 с 7)
    const rest = val.slice(2).replace(/\D/g, "").slice(0, 10);
    setPhone("+7" + rest);
  };

  // ─── Отправка кода ────────────────────────────────────────────────────────────

  const handleSendCode = async () => {
    if (digits().length < 11) {
      toast({ title: "Введите номер телефона полностью", variant: "destructive" });
      return;
    }
    setLoading(true);
    setNoTelegram(false);
    try {
      const check = await api.auth.checkPhone(digits());
      setIsReturning(check.exists && check.hasRole);
      const result = await api.auth.sendCode(digits());
      setDevCode(result.dev_code || null);
      if (result.channel === "none") setNoTelegram(true);
      setStep("code");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast({ title: "Ошибка", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Проверка кода ────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (code.length < 4) {
      toast({ title: "Введите 4-значный код", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.verifyCode(digits(), code);
      setCode("");
      setDevCode(null);
      setUserFromLogin(result.user as any, result.token);
      if (result.role) {
        onClose();
      } else {
        setStep("name");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast({ title: "Неверный код", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Сохранение имени ─────────────────────────────────────────────────────────

  const handleSaveName = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn) {
      toast({ title: "Введите ваше имя", variant: "destructive" });
      return;
    }
    setLoading(true);
    try { await api.auth.updateProfile({ firstName: fn, lastName: ln }); } catch {}
    finally { setLoading(false); }
    setShowRoleSelector(true);
  };

  // ─── Email вход ───────────────────────────────────────────────────────────────

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    if (emailMode === "register" && password !== confirmPassword) {
      toast({ title: t("auth.passwords_no_match"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = emailMode === "register"
        ? await api.auth.registerEmail(email, password)
        : await api.auth.loginEmail(email, password);
      setUserFromLogin(result.user as any, result.token);
      if (result.role) { onClose(); } else { setStep("name"); }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast({ title: "Ошибка", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Стили ───────────────────────────────────────────────────────────────────

  const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const btnPrimary = "w-full mt-4 bg-primary text-primary-foreground font-black text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50";

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
          <div className="flex justify-center mb-5"><BrandLogo size="md" /></div>

          {/* ── ШАГ 1: НОМЕР ТЕЛЕФОНА ── */}
          {step === "phone" && (
            <>
              <h2 className="text-2xl font-black text-center">Вход / Регистрация</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Введите номер — код придёт в Telegram
              </p>
              <div className="mt-6">
                <div className="relative">
                  <Phone size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                    placeholder="+7 777 123 45 67"
                    className={inputCls}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  />
                </div>

                {/* Подсказка про бота */}
                <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <MessageCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-foreground/70 leading-relaxed">
                    Код придёт от бота{" "}
                    <a
                      href={`https://t.me/${TELEGRAM_BOT}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-primary underline"
                    >
                      @{TELEGRAM_BOT}
                    </a>
                    . Если ещё не писали боту — нажмите на ссылку, напишите /start, и возвращайтесь.
                  </div>
                </div>

                <button onClick={handleSendCode} disabled={loading} className={btnPrimary}>
                  {loading
                    ? <Loader2 size={20} className="animate-spin" />
                    : <>Получить код <ArrowRight size={20} /></>
                  }
                </button>

                {/* Email — мелко внизу */}
                <button
                  onClick={() => setStep("email")}
                  className="w-full mt-3 text-xs text-muted-foreground font-bold py-2 flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Mail size={13} /> Войти через email
                </button>
              </div>
            </>
          )}

          {/* ── ШАГ 2: КОД ── */}
          {step === "code" && (
            <>
              <h2 className="text-2xl font-black text-center">
                {isReturning ? "Добро пожаловать!" : "Подтвердите номер"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                {phone}
              </p>

              {devCode && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-xs font-bold text-yellow-700">Тестовый код:</p>
                  <p className="text-3xl font-black tracking-widest text-primary mt-1">{devCode}</p>
                </div>
              )}

              {!devCode && !noTelegram && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <MessageCircle size={16} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">Код отправлен в Telegram от @{TELEGRAM_BOT}</p>
                </div>
              )}

              {noTelegram && (
                <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-xs font-bold text-orange-700 mb-1">Бот ещё не знает ваш номер</p>
                  <p className="text-xs text-orange-600">
                    Напишите боту{" "}
                    <a href={`https://t.me/${TELEGRAM_BOT}`} target="_blank" rel="noopener noreferrer" className="font-black underline">
                      @{TELEGRAM_BOT}
                    </a>{" "}
                    команду <span className="font-black">/start</span> — он пришлёт код.
                  </p>
                </div>
              )}

              <div className="mt-5">
                <p className="text-xs font-bold text-center text-muted-foreground mb-3">Введите 4-значный код</p>
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={code[i] || ""}
                      autoFocus={i === 0}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const arr = code.split("");
                        arr[i] = val;
                        setCode(arr.join(""));
                        if (val && i < 3) {
                          document.getElementById(`otp-${i + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[i] && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      className="w-16 h-16 text-center text-2xl font-black rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>

                <button onClick={handleVerify} disabled={loading} className={btnPrimary}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Подтвердить"}
                </button>
                <button
                  onClick={() => { setStep("phone"); setCode(""); setDevCode(null); setNoTelegram(false); }}
                  className="w-full mt-2 text-sm font-bold text-muted-foreground py-2"
                >
                  ← Изменить номер
                </button>
              </div>
            </>
          )}

          {/* ── ШАГ 3: ИМЯ (только для новых) ── */}
          {step === "name" && (
            <>
              <h2 className="text-2xl font-black text-center">Как вас зовут?</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">Последний шаг — и вы в системе</p>
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Имя *"
                    className={inputCls}
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Фамилия"
                    className={inputCls}
                  />
                </div>
              </div>
              <button onClick={handleSaveName} disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Продолжить <ArrowRight size={20} /></>}
              </button>
            </>
          )}

          {/* ── EMAIL (альтернативный метод) ── */}
          {step === "email" && (
            <>
              <h2 className="text-2xl font-black text-center">
                {emailMode === "login" ? "Вход через email" : "Регистрация через email"}
              </h2>
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                    className={inputCls + " pr-11"}
                    autoComplete={emailMode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {emailMode === "register" && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      className={inputCls + " pr-11"}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirmPass((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}
              </div>
              <button onClick={handleEmailAuth} disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>{emailMode === "login" ? "Войти" : "Зарегистрироваться"} <ArrowRight size={20} /></>}
              </button>
              <button onClick={() => setEmailMode((m) => m === "login" ? "register" : "login")} className="w-full mt-2 text-sm font-bold text-muted-foreground py-2">
                {emailMode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
              </button>
              <button onClick={() => setStep("phone")} className="w-full mt-1 text-xs text-muted-foreground py-1.5">
                ← Войти через Telegram
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
