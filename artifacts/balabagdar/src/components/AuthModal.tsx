import { useState } from "react";
import {
  X, Phone, ArrowRight, Loader2, MessageCircle,
  Mail, Lock, Eye, EyeOff, User,
} from "lucide-react";
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

/**
 * Шаги:
 *  phone       — ввод номера
 *  password    — ввод пароля (уже зарегист., есть пароль)
 *  code        — ввод OTP (нет пароля → код в Telegram)
 *  set-password— придумать пароль (после первого OTP)
 *  name        — ввод имени (новый пользователь)
 *  email       — альтернативный вход
 */
type Step = "phone" | "password" | "code" | "set-password" | "name" | "email";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const { setUserFromLogin } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+7");
  const [loading, setLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // OTP
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [noTelegram, setNoTelegram] = useState(false);

  // Пароли
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Имя
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Email
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [showEmailPass, setShowEmailPass] = useState(false);

  if (!open) return null;
  if (showRoleSelector) {
    return <RoleSelector onComplete={() => { setShowRoleSelector(false); onClose(); }} />;
  }

  const digits = () => phone.replace(/\D/g, "");

  const handlePhoneInput = (val: string) => {
    if (!val.startsWith("+7")) { setPhone("+7"); return; }
    const rest = val.slice(2).replace(/\D/g, "").slice(0, 10);
    setPhone("+7" + rest);
  };

  const finishLogin = (result: { user: Record<string, unknown>; token: string; role: string | null }) => {
    setUserFromLogin(result.user as any, result.token);
    if (result.role) {
      onClose();
    } else {
      setShowRoleSelector(true);
    }
  };

  // ─── Шаг 1: проверяем номер и решаем что дальше ───────────────────────────────

  const handlePhoneNext = async () => {
    if (digits().length < 11) {
      toast({ title: "Введите номер полностью", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const check = await api.auth.checkPhone(digits());

      if (check.hasPassword) {
        // Уже зарегистрирован и есть пароль → просто вводим пароль
        setPassword("");
        setStep("password");
      } else {
        // Нет пароля (новый или регистрировался раньше без него) → OTP
        const result = await api.auth.sendCode(digits());
        setDevCode(result.dev_code || null);
        setNoTelegram(result.channel === "none");
        setCode("");
        setStep("code");
      }
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "Попробуйте снова", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Шаг 2a: вход по паролю (без OTP) ────────────────────────────────────────

  const handlePasswordLogin = async () => {
    if (!password) {
      toast({ title: "Введите пароль", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.loginPhonePassword(digits(), password);
      finishLogin(result);
    } catch (err: unknown) {
      toast({ title: "Неверный пароль", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Забыл пароль — отправляем OTP
  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const result = await api.auth.sendCode(digits());
      setDevCode(result.dev_code || null);
      setNoTelegram(result.channel === "none");
      setCode("");
      setStep("code");
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Шаг 2b: проверка OTP ─────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (code.length < 4) {
      toast({ title: "Введите 4-значный код", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.verifyCode(digits(), code);
      setUserFromLogin(result.user as any, result.token);
      setCode("");
      setDevCode(null);
      // После OTP всегда просим создать пароль (новый или уже был без пароля)
      setNewPassword("");
      setConfirmPassword("");
      setStep("set-password");
    } catch (err: unknown) {
      toast({ title: "Неверный код", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Шаг 3: создать пароль (после OTP) ───────────────────────────────────────

  const handleSetPassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Пароль должен быть минимум 6 символов", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Пароли не совпадают", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.auth.setPhonePassword(newPassword);
    } catch {}
    finally { setLoading(false); }
    // Теперь проверяем — есть ли у пользователя роль
    try {
      const me = await api.auth.me();
      if (me.role) {
        onClose();
      } else {
        setStep("name");
      }
    } catch {
      setStep("name");
    }
  };

  // ─── Шаг 4: имя (только для новых) ───────────────────────────────────────────

  const handleSaveName = async () => {
    if (!firstName.trim()) {
      toast({ title: "Введите ваше имя", variant: "destructive" });
      return;
    }
    setLoading(true);
    try { await api.auth.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }); } catch {}
    finally { setLoading(false); }
    setShowRoleSelector(true);
  };

  // ─── Email ────────────────────────────────────────────────────────────────────

  const handleEmailAuth = async () => {
    if (!email || !emailPass) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    if (emailMode === "register" && emailPass !== emailConfirm) {
      toast({ title: "Пароли не совпадают", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = emailMode === "register"
        ? await api.auth.registerEmail(email, emailPass)
        : await api.auth.loginEmail(email, emailPass);
      finishLogin(result);
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Стили ───────────────────────────────────────────────────────────────────

  const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const inputRCls = "w-full pl-11 pr-11 py-3.5 rounded-xl bg-muted text-foreground text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const btnPrimary = "w-full mt-4 bg-primary text-primary-foreground font-black text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50";
  const btnGhost = "w-full mt-2 text-sm font-bold text-muted-foreground py-2 hover:text-foreground transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center z-10">
          <X size={16} className="text-muted-foreground" />
        </button>

        <div className="px-6 pt-6 pb-8">
          <div className="flex justify-center mb-5"><BrandLogo size="md" /></div>

          {/* ══════════════ ШАГ: НОМЕР ══════════════ */}
          {step === "phone" && (
            <>
              <h2 className="text-2xl font-black text-center">Вход / Регистрация</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">Введите номер телефона</p>
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
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneNext()}
                  />
                </div>
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-foreground/70">
                  <MessageCircle size={15} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Если входите первый раз — код придёт от бота{" "}
                    <a href={`https://t.me/${TELEGRAM_BOT}`} target="_blank" rel="noopener noreferrer"
                      className="font-black text-primary underline">@{TELEGRAM_BOT}</a>.
                    Напишите ему /start один раз — и всё готово.
                  </span>
                </div>
                <button onClick={handlePhoneNext} disabled={loading} className={btnPrimary}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <>Продолжить <ArrowRight size={20} /></>}
                </button>
                <button onClick={() => setStep("email")} className={btnGhost + " flex items-center justify-center gap-1.5 text-xs opacity-70"}>
                  <Mail size={13} /> Войти через email
                </button>
              </div>
            </>
          )}

          {/* ══════════════ ШАГ: ПАРОЛЬ (быстрый вход) ══════════════ */}
          {step === "password" && (
            <>
              <h2 className="text-2xl font-black text-center">Добро пожаловать!</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{phone}</p>
              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ваш пароль</label>
                <div className="relative mt-1.5">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className={inputRCls}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button onClick={handlePasswordLogin} disabled={loading} className={btnPrimary}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Войти"}
                </button>
                <button onClick={handleForgotPassword} disabled={loading} className={btnGhost}>
                  {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                  Забыл пароль — войти через Telegram
                </button>
                <button onClick={() => { setStep("phone"); setPassword(""); }} className={btnGhost + " text-xs opacity-60"}>
                  ← Изменить номер
                </button>
              </div>
            </>
          )}

          {/* ══════════════ ШАГ: OTP КОД ══════════════ */}
          {step === "code" && (
            <>
              <h2 className="text-2xl font-black text-center">Код из Telegram</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{phone}</p>

              {devCode && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-xs font-bold text-yellow-700">Тестовый код:</p>
                  <p className="text-3xl font-black tracking-widest text-primary mt-1">{devCode}</p>
                </div>
              )}
              {!devCode && !noTelegram && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <MessageCircle size={15} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/70">Код отправлен в Telegram от @{TELEGRAM_BOT}</p>
                </div>
              )}
              {noTelegram && (
                <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-xs font-black text-orange-700 mb-1">Бот ещё не знает ваш номер</p>
                  <p className="text-xs text-orange-600">
                    Напишите боту{" "}
                    <a href={`https://t.me/${TELEGRAM_BOT}`} target="_blank" rel="noopener noreferrer" className="font-black underline">
                      @{TELEGRAM_BOT}
                    </a>{" "}
                    — /start, и он пришлёт код.
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
                        if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[i] && i > 0)
                          document.getElementById(`otp-${i - 1}`)?.focus();
                      }}
                      className="w-16 h-16 text-center text-2xl font-black rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading} className={btnPrimary}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Подтвердить"}
                </button>
                <button onClick={() => { setStep("phone"); setCode(""); setDevCode(null); setNoTelegram(false); }} className={btnGhost + " text-xs opacity-60"}>
                  ← Изменить номер
                </button>
              </div>
            </>
          )}

          {/* ══════════════ ШАГ: СОЗДАТЬ ПАРОЛЬ ══════════════ */}
          {step === "set-password" && (
            <>
              <h2 className="text-2xl font-black text-center">Придумайте пароль</h2>
              <p className="text-sm text-muted-foreground text-center mt-1 px-2">
                В следующий раз войдёте по номеру и паролю — без ожидания кода
              </p>
              <div className="mt-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Новый пароль</label>
                  <div className="relative mt-1.5">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className={inputRCls}
                      autoFocus
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowNewPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Повторите пароль</label>
                  <div className="relative mt-1.5">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ещё раз"
                      className={inputCls}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSetPassword} disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Сохранить и продолжить <ArrowRight size={20} /></>}
              </button>
            </>
          )}

          {/* ══════════════ ШАГ: ИМЯ ══════════════ */}
          {step === "name" && (
            <>
              <h2 className="text-2xl font-black text-center">Как вас зовут?</h2>
              <p className="text-sm text-muted-foreground text-center mt-1">Последний шаг!</p>
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
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
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

          {/* ══════════════ EMAIL ══════════════ */}
          {step === "email" && (
            <>
              <h2 className="text-2xl font-black text-center">
                {emailMode === "login" ? "Вход через email" : "Регистрация через email"}
              </h2>
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" className={inputCls} autoComplete="email" />
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showEmailPass ? "text" : "password"}
                    value={emailPass}
                    onChange={(e) => setEmailPass(e.target.value)}
                    placeholder="Пароль"
                    className={inputRCls}
                    autoComplete={emailMode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" onClick={() => setShowEmailPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showEmailPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {emailMode === "register" && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="password" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)}
                      placeholder="Повторите пароль" className={inputCls} autoComplete="new-password" />
                  </div>
                )}
              </div>
              <button onClick={handleEmailAuth} disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>{emailMode === "login" ? "Войти" : "Зарегистрироваться"} <ArrowRight size={20} /></>}
              </button>
              <button onClick={() => setEmailMode(m => m === "login" ? "register" : "login")} className={btnGhost}>
                {emailMode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Есть аккаунт? Войти"}
              </button>
              <button onClick={() => setStep("phone")} className={btnGhost + " text-xs opacity-60"}>
                ← Войти через Telegram
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
