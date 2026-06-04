import { useEffect, useState } from "react";
import { Star, Trash2, Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import AuthModal from "@/components/AuthModal";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  author_name: string | null;
  created_at: string;
}

interface Props {
  clubId: string;
}

const StarPicker = ({ value, onChange, size = 28 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange?.(n)}
        disabled={!onChange}
        className={`transition-transform ${onChange ? "hover:scale-110 active:scale-95 cursor-pointer" : "cursor-default"}`}
        aria-label={`${n} stars`}
      >
        <Star
          size={size}
          className={n <= value ? "text-secondary fill-secondary" : "text-muted-foreground/30"}
        />
      </button>
    ))}
  </div>
);

const ClubReviews = ({ clubId }: Props) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, author_name, created_at")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [clubId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview?.id]);

  const handleSubmit = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (rating < 1) {
      toast.error(t("reviews.rating_required"));
      return;
    }
    setSubmitting(true);

    // get author name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const payload = {
      club_id: clubId,
      user_id: user.id,
      rating,
      comment: comment.trim(),
      author_name: profile?.display_name || "",
    };

    const { error } = myReview
      ? await supabase.from("reviews").update(payload).eq("id", myReview.id)
      : await supabase.from("reviews").insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("reviews.success"));
    fetchReviews();
  };

  const handleDelete = async () => {
    if (!myReview) return;
    const { error } = await supabase.from("reviews").delete().eq("id", myReview.id);
    if (error) return toast.error(error.message);
    setRating(0);
    setComment("");
    toast.success(t("reviews.deleted"));
    fetchReviews();
  };

  const handleReport = async (reviewId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    const { error } = await supabase.from("review_reports").insert({
      review_id: reviewId,
      user_id: user.id,
      reason: "",
    });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success(t("reviews.reported"));
  };

  return (
    <div className="px-4 mt-4">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <h2 className="font-black text-sm mb-2">{t("reviews.title")}</h2>

      {/* Form */}
      <div className="cartoon-card p-4 mb-3">
        <p className="text-xs font-bold text-muted-foreground mb-2">{t("reviews.your_rating")}</p>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder={t("reviews.comment_placeholder")}
          rows={3}
          className="mt-3 w-full rounded-xl border-[3px] border-foreground/10 bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-primary text-primary-foreground font-black text-sm py-2.5 rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {!user ? t("reviews.login_required") : myReview ? t("reviews.update") : t("reviews.submit")}
          </button>
          {myReview && (
            <button
              onClick={handleDelete}
              className="px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive font-black"
              aria-label={t("reviews.delete")}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={20} /></div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground font-bold py-4">{t("reviews.empty")}</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="cartoon-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm truncate">
                      {r.user_id === user?.id ? t("reviews.you") : (r.author_name || "★")}
                    </span>
                    <StarPicker value={r.rating} size={14} />
                  </div>
                  {r.comment && <p className="text-sm mt-1 whitespace-pre-line break-words">{r.comment}</p>}
                </div>
                {r.user_id !== user?.id && (
                  <button
                    onClick={() => handleReport(r.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={t("reviews.report")}
                    title={t("reviews.report")}
                  >
                    <Flag size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubReviews;
