import { useState } from "react";
import { X, Phone, Send, ArrowRight } from "lucide-react";
import logo from "@/assets/balahub-logo.png";
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7 ");
  const [code, setCode] = useState("");

  if (!open) return null;

  const handleSendCode = () => {
    if (phone.replace(/\D/g, "").length < 11) {
      toast({ title: "Ошибка", description: "Введите корректный номер телефона", variant: "destructive" });
      return;
    }
    setStep("code");
    toast({ title: "Код отправлен", description: "Проверьте Telegram для получения кода" });
  };

  const handleVerify = () => {
    if (code.length < 4) {
      toast({ title: "Ошибка", description: "Введите 4-значный код", variant: "destructive" });
      return;
    }
    toast({ title: "Добро пожаловать! 🎉", description: "Вы успешно зарегистрировались" });
    onClose();
    setStep("phone");
    setCode("");
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
          <h2 className="text-xl font-black text-center">
            {step === "phone" ? "Вход в BalaHub" : "Подтверждение"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {step === "phone"
              ? "Введите номер телефона для регистрации"
              : `Код отправлен в Telegram на ${phone}`}
          </p>

          {step === "phone" ? (
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
                <Send size={16} className="text-secondary shrink-0" />
                <p className="text-xs text-foreground/70">Код подтверждения придёт в <strong>Telegram</strong></p>
              </div>
              <button
                onClick={handleSendCode}
                className="w-full mt-5 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                Получить код <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Код из Telegram</label>
              <div className="flex gap-2.5 mt-2 justify-center">
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
                className="w-full mt-6 bg-primary text-primary-foreground font-bold text-base py-3.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all"
              >
                Подтвердить
              </button>
              <button
                onClick={() => setStep("phone")}
                className="w-full mt-2 text-muted-foreground font-bold text-sm py-2"
              >
                Изменить номер
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
