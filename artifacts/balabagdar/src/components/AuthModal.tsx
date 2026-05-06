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

// Шаги авторизации:
// method → phone → code → name (только новые) → [RoleSelector только новые]
// method → email
type Step = "method" | "phone" | "code" | "name" | "email";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { t } = useLanguage();
  const { setUserFromLogin } = useAuth();

  const [step, setStep] = useState<Step>("method");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Известно после check-phone
  const [isReturning, setIsReturning] = useState(false);

  // Telegram OTP state
  const [devCode, setDevCode] = useState<string | null>(null);
  const [channel, setChannel] = useState<"telegram" | "dev" | "none" | null>(null);

  // Name step (для новых пользователей)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Email auth state
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  if (!open) return null;

  if (showRoleSelector) {
    return (
      <RoleSelector
        onComplete={() => {
          setShowRoleSelector(false);
          onClose();
        }}
      />
    );
  }

  const digits = () => phone.replace(/\D/g, "");

  // ─── Telegram: ввод номера + отправка кода ───────────────────────────────────

  const handleSendCode = async () => {
    if (digits().length < 11) {
      toast({ title: t("common.error"), description: t("auth.enter_phone"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Проверяем — новый или возвращающийся пользователь
      const check = await api.auth.checkPhone(digits());
      setIsReturning(check.exists && check.hasRole);

      const result = await api.auth.sendCode(digits());
      setChannel(result.channel as "telegram" | "dev" | "none");
      setStep("code");
      if (result.dev_code) {
        setDevCode(result.dev_code);
      } else if (result.channel === "telegram") {
        toast({ title: t("auth.code_sent"), description: t("auth.check_telegram") });
      } else if (result.channel === "none" && result.deepLink) {
        window.open(result.deepLink, "_blank");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: t("common.error"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Telegram: проверка кода ─────────────────────────────────────────────────

  const handleVerify = async () => {
    if (code.length < 4) {
      toast({ title: t("common.error"), description: t("auth.enter_code"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.verifyCode(digits(), code);
      setCode("");
      setDevCode(null);
      setChannel(null);
      setUserFromLogin(result.user as any, result.token);

      if (result.role) {
        // Возвращающийся пользователь с ролью → просто закрываем
        onClose();
      } else {
        // Новый пользователь → просим имя → потом роль
        setStep("name");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: t("common.error"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Имя нового пользователя ─────────────────────────────────────────────────

  const handleSaveName = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn) {
      toast({ title: t("common.error"), description: "Введите ваше имя", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.auth.updateProfile({ firstName: fn, lastName: ln });
    } catch {
      // не критично, продолжаем
    } finally {
      setLoading(false);
    }
    setShowRoleSelector(true);
  };

  // ─── Email flow ──────────────────────────────────────────────────────────────

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: t("common.error"), description: "Заполните все поля", variant: "destructive" });
      return;
    }
    if (emailMode === "register" && password !== confirmPassword) {
      toast({ title: t("common.error"), description: t("auth.passwords_no_match"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result =
        emailMode === "register"
          ? await api.auth.registerEmail(email, password)
          : await api.auth.loginEmail(email, password);
      setUserFromLogin(result.user as any, result.token);
      if (result.role) {
        onClose();
      } else {
        setStep("name");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast({ title: t("common.error"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Стили ───────────────────────────────────────────────────────────────────

  const inputCls =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const btnPrimary =
    "w-full mt-4 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50";
  const btnGhost = "w-full mt-2 text-muted-foreground font-bold text-sm py-2";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="px-6 pt-6 pb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="md" />
          </div>

          {/* ── ВЫБОР МЕТОДА ── */}
          {step === "method" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.title")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{t("auth.choose_method")}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setStep("phone")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{t("auth.via_telegram")}</p>
                    <p className="text-xs text-muted-foreground">{t("auth.via_telegram_desc")}</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground ml-auto shrink-0" />
                </button>

                <button
                  onClick={() => { setStep("email"); setEmailMode("login"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-secondary transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mail size={24} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{t("auth.via_email")}</p>
                    <p className="text-xs text-muted-foreground">{t("auth.via_email_desc")}</p>
                  </div>
                  <ArrowRight size={18} className="text-muted-foreground ml-auto shrink-0" />
                </button>
              </div>
            </>
          )}

          {/* ── TELEGRAM: НОМЕР ── */}
          {step === "phone" && (
            <>
              <h2 className="text-xl font-black text-center">{t("auth.via_telegram")}</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{t("auth.enter_phone")}</p>
              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("auth.phone_label")}
                </label>
                <div className="relative mt-1.5">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("auth.phone_placeholder")}
                    className={inputCls}
                    autoFocus
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
                  <MessageCircle size={13} />
                  Привязать Telegram к номеру → @{TELEGRAM_BOT}
                </a>
                <button onClick={handleSendCode} disabled={loading} className={btnPrimary}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>{t("auth.get_code")} <ArrowRight size={18} /></>
                  )}
                </button>
                <button onClick={() => setStep("method")} className={btnGhost}>
                  {t("auth.back_to_method")}
                </button>
              </div>
            </>
          )}

          {/* ── TELEGRAM: КОД ── */}
          {step === "code" && (
            <>
              <h2 className="text-xl font-black text-center">
                {isReturning ? "Вход в аккаунт" : "Подтверждение номера"}
              </h2>
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
                    Открылся Telegram — бот пришлёт код. Вернитесь и введите его ниже.
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
                        if (val && i < 3)
                          (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }}
                      className="w-14 h-14 text-center text-2xl font-black rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading} className={btnPrimary}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : t("auth.confirm")}
                </button>
                <button
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setDevCode(null);
                    setChannel(null);
                  }}
                  className={btnGhost}
                >
                  {t("auth.change_number")}
                </button>
              </div>
            </>
          )}

          {/* ── ИМЯ (только для новых пользователей) ── */}
          {step === "name" && (
            <>
              <h2 className="text-xl font-black text-center">Как вас зовут?</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Укажите имя, чтобы завершить регистрацию
              </p>
              <div className="mt-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Имя *</label>
                  <div className="relative mt-1.5">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Айгерим"
                      className={inputCls}
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Фамилия</label>
                  <div className="relative mt-1.5">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Сейткали"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveName} disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Продолжить <ArrowRight size={18} /></>}
              </button>
            </>
          )}

          {/* ── EMAIL ФОРМА ── */}
          {step === "email" && (
            <>
              <h2 className="text-xl font-black text-center">
                {emailMode === "login" ? t("auth.login") : t("auth.register")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{t("auth.via_email")}</p>
              <div className="mt-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("auth.email_label")}
                  </label>
                  <div className="relative mt-1.5">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.email_placeholder")}
                      className={inputCls}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("auth.password_label")}
                  </label>
                  <div className="relative mt-1.5">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.password_placeholder")}
                      className={inputCls + " pr-11"}
                      autoComplete={emailMode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {emailMode === "register" && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t("auth.confirm_password")}
                    </label>
                    <div className="relative mt-1.5">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("auth.confirm_password")}
                        className={inputCls + " pr-11"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleEmailAuth} disabled={loading} className={btnPrimary}>
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {emailMode === "login" ? t("auth.login") : t("auth.register")}{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <button
                onClick={() => setEmailMode((m) => (m === "login" ? "register" : "login"))}
                className={btnGhost}
              >
                {emailMode === "login" ? t("auth.no_account") : t("auth.have_account")}
              </button>
              <button onClick={() => setStep("method")} className={btnGhost + " text-xs opacity-60"}>
                {t("auth.back_to_method")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
