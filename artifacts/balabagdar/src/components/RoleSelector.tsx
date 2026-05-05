import { useState } from "react";
import { Users, Building2, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

interface RoleSelectorProps {
  onComplete: () => void;
}

const RoleSelector = ({ onComplete }: RoleSelectorProps) => {
  const { t } = useLanguage();
  const { assignRole } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (role: AppRole) => {
    setLoading(true);
    setError(null);
    const err = await assignRole(role);
    setLoading(false);
    if (!err) {
      if (role === "club_owner") {
        onComplete();
        navigate("/club/edit");
      } else {
        onComplete();
      }
    } else {
      setError(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="bg-card rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-slide-up">
        <div className="flex justify-center mb-4">
          <BrandLogo size="md" />
        </div>
        <h2 className="text-xl font-black text-center">{t("role.title")}</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">{t("role.subtitle")}</p>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => handleSelect("parent")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-black text-sm">{t("role.parent")}</p>
                <p className="text-xs text-muted-foreground">{t("role.parent_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => handleSelect("club_owner")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-secondary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Building2 size={24} className="text-secondary" />
              </div>
              <div>
                <p className="font-black text-sm">{t("role.club")}</p>
                <p className="text-xs text-muted-foreground">{t("role.club_desc")}</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;
