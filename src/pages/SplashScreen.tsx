import { useEffect, useState } from "react";
import logo from "@/assets/balahub-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 2000);
    const t2 = setTimeout(onComplete, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${
        phase === "exit" ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
      style={{ background: "linear-gradient(160deg, hsl(152, 60%, 40%) 0%, hsl(160, 50%, 28%) 100%)" }}
    >
      <div className="animate-scale-in">
        <img src={logo} alt="BalaHub" className="w-28 h-28 drop-shadow-2xl" />
      </div>
      <h1 className="text-4xl font-black text-primary-foreground tracking-tight mt-4 animate-fade-in">
        BalaHub
      </h1>
      <p className="text-primary-foreground/70 mt-2 text-base font-semibold animate-fade-in" style={{ animationDelay: "0.2s" }}>
        Развитие начинается здесь
      </p>
      <div className="mt-10 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary-foreground/50 animate-bounce-soft"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
