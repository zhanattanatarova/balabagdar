import { safeImageUrl } from "@/lib/safeUrl";

type C = Record<string, any>;
const PRIOR = 4.5;
const PRIOR_N = 10;

/** Bayesian-weighted rating combining 2GIS and BalaHub reviews. */
export function reliableRating(c: C): number {
  const n2 = Number(c.twogis_reviews_count) > 0 && Number(c.twogis_rating) > 0 ? Number(c.twogis_reviews_count) : 0;
  const nb = Number(c.reviews_count) > 0 && Number(c.rating) > 0 ? Number(c.reviews_count) : 0;
  return (Number(c.twogis_rating || 0) * n2 + Number(c.rating || 0) * nb + PRIOR * PRIOR_N) / (n2 + nb + PRIOR_N);
}

/** A visible rating (2GIS or BalaHub) below 3.5 keeps the club out of "Popular". */
export function hasLowRating(c: C): boolean {
  const low = (r: unknown, n: unknown) => Number(n) > 0 && Number(r) > 0 && Number(r) < 3.5;
  return low(c.twogis_rating, c.twogis_reviews_count) || low(c.rating, c.reviews_count);
}

export function popularSort<T extends C>(clubs: T[], limit = 10): T[] {
  const complete = (c: C) => (safeImageUrl(c.avatar_url) && Number(c.price_from) > 0 ? 1 : 0);
  return clubs
    .filter((c) => !hasLowRating(c))
    .sort((a, b) => complete(b) - complete(a)
      || reliableRating(b) - reliableRating(a)
      || Number(b.views_count || 0) - Number(a.views_count || 0))
    .slice(0, limit);
}
