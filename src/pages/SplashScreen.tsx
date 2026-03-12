import { useEffect, useState } from "react";
import logo from "@/assets/balahub-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 1800);
    const t2 = setTimeout(onComplete, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${
        phase === "exit" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ background: "linear-gradient(160deg, hsl(45, 100%, 52%) 0%, hsl(30, 100%, 48%) 100%)" }}
    >
      <div className="relative">
        <img src={logo} alt="BalaHub" className="w-32 h-32 drop-shadow-2xl animate-dance" />
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce-soft">✨</div>
        <div className="absolute -bottom-1 -left-3 text-xl animate-bounce-soft" style={{ animationDelay: "0.3s" }}>🌟</div>
      </div>
      <h1 className="text-4xl font-black text-primary-foreground tracking-tight mt-3 animate-fade-in drop-shadow-lg">
        BalaHub
      </h1>
      <p className="text-primary-foreground/70 mt-1.5 text-sm font-bold animate-fade-in" style={{ animationDelay: "0.15s" }}>
        Кружки и специалисты для детей 🎨⚽🎵
      </p>
    </div>
  );
};

export default SplashScreen;
