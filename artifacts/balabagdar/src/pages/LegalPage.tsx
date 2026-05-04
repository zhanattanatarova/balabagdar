import { ArrowLeft, Shield, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import BrandLogo from "@/components/BrandLogo";

const LegalPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="relative h-44 rounded-b-3xl overflow-hidden" style={{ background: "var(--gradient-header)" }}>
        <div className="absolute inset-0 flex items-center px-5 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-primary-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrandLogo size="xs" />
              <span className="text-primary-foreground/80 text-xs font-bold">{t("legal.header_sub")}</span>
            </div>
            <h1 className="text-xl font-black text-primary-foreground">{t("legal.title")}</h1>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30" style={{
          background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 60\"><path d=\"M0 40 Q50 10 100 35 Q150 60 200 30 Q250 5 300 35 Q350 55 400 25 L400 60 L0 60Z\" fill=\"white\"/></svg>') no-repeat bottom",
          backgroundSize: "cover"
        }} />
      </div>

      <div className="px-4 mt-5 space-y-4">

        <div className="cartoon-card p-4 border-l-4 border-amber-400">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-black text-sm mb-1">{t("legal.disclaimer_title")}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("legal.disclaimer_text")}</p>
            </div>
          </div>
        </div>

        <div className="cartoon-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Info size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-black text-sm mb-2">{t("legal.platform_title")}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("legal.platform_text")}</p>
            </div>
          </div>
        </div>

        <div className="cartoon-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-black text-sm mb-2">{t("legal.safety_title")}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("legal.safety_text")}</p>
            </div>
          </div>
        </div>

        <div className="cartoon-card p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-black text-sm mb-2">{t("legal.verify_title")}</h2>
              <ul className="space-y-1.5">
                {["legal.verify1", "legal.verify2", "legal.verify3", "legal.verify4"].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-green-500 font-black text-xs mt-0.5">✓</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{t(key as any)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="cartoon-card p-4">
          <h2 className="font-black text-sm mb-2">{t("legal.liability_title")}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("legal.liability_text")}</p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pb-2 font-bold">
          BalaBagdar © {new Date().getFullYear()} · {t("legal.footer")}
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
