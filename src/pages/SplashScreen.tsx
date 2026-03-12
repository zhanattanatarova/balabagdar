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
      style={{ background: "linear-gradient(160deg, hsl(145, 65%, 48%) 0%, hsl(145, 55%, 35%) 100%)" }}
    >
      <div className="relative">
        <img src={logo} alt="Balausa" className="w-36 h-36 drop-shadow-2xl animate-dance" />
      </div>
      <h1 className="text-4xl font-black text-primary-foreground tracking-tight mt-4 animate-fade-in drop-shadow-lg">
        Balausa
      </h1>
      <p className="text-primary-foreground/80 mt-2 text-sm font-bold animate-fade-in" style={{ animationDelay: "0.15s" }}>
        Все кружки и специалисты для детей
      </p>
    </div>
  );
};

export default SplashScreen;
