export type Lang = "ru" | "kz" | "en";

/** True only when the club has a real 2GIS rating recorded. */
export function hasTwoGisRating(rating: number | string | null | undefined): boolean {
  if (rating === null || rating === undefined || rating === "") return false;
  const n = Number(rating);
  return Number.isFinite(n) && n > 0;
}

export function formatTwoGisRating(rating: number | string): string {
  return Number(rating).toFixed(1);
}

function ruReviews(n: number): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "отзыв";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "отзыва";
  return "отзывов";
}

/** "39 отзывов в 2GIS" / "2GIS-те 39 пікір" / "39 reviews on 2GIS" */
export function twoGisReviewsLabel(count: number | null | undefined, lang: Lang): string {
  const n = Number(count || 0);
  if (lang === "kz") return `2GIS-те ${n} пікір`;
  if (lang === "en") return `${n} ${n === 1 ? "review" : "reviews"} on 2GIS`;
  return `${n} ${ruReviews(n)} в 2GIS`;
}

/** Link to the reviews tab of the 2GIS firm page. */
export function twoGisReviewsUrl(url: string | null | undefined): string | null {
  if (!url || !/^https:\/\/(www\.)?2gis\.[a-z]+\//i.test(url)) return null;
  return url.replace(/\/+$/, "").replace(/\/tab\/reviews$/, "") + "/tab/reviews";
}
