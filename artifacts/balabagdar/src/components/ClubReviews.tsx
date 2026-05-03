import { useEffect, useState } from "react";
import { Star, Trash2, Flag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import AuthModal from "@/components/AuthModal";

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  authorName: string | null;
  createdAt: string;
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

  const myReview = reviews.find((r) => r.userId === user?.id);

  const fetchReviews = async () => {
    try {
      const data = await api.reviews.forClub(clubId);
      setReviews(data || []);
    } catch {}
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
    try {
      await api.reviews.submit(clubId, {
        rating,
        comment: comment.trim(),
        author_name: user.displayName || "",
      });
      toast.success(t("reviews.success"));
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    try {
      await api.reviews.delete(myReview.id);
      setRating(0);
      setComment("");
      toast.success(t("reviews.deleted"));
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      await api.reviews.report(reviewId);
      toast.success(t("reviews.reported"));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="px-4 mt-4">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <h2 className="font-black text-sm mb-2">{t("reviews.title")}</h2>

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
                      {r.userId === user?.id ? t("reviews.you") : (r.authorName || "★")}
                    </span>
                    <StarPicker value={r.rating} size={14} />
                  </div>
                  {r.comment && <p className="text-sm mt-1 whitespace-pre-line break-words">{r.comment}</p>}
                </div>
                {r.userId !== user?.id && (
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
