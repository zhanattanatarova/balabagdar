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
      style={{ background: "linear-gradient(160deg, hsl(45, 100%, 50%) 0%, hsl(35, 100%, 48%) 100%)" }}
    >
      <img src={logo} alt="BalaHub" className="w-28 h-28 drop-shadow-xl animate-dance" />
      <h1 className="text-3xl font-black text-primary-foreground tracking-tight mt-2 animate-fade-in">
        BalaHub
      </h1>
      <p className="text-primary-foreground/60 mt-1 text-sm font-semibold animate-fade-in" style={{ animationDelay: "0.15s" }}>
        Кружки и специалисты для детей
      </p>
    </div>
  );
};

export default SplashScreen;
