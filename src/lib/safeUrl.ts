/**
 * Safe URL helpers — prevent javascript:/data: URI XSS via DB-stored values.
 * All user-supplied URLs rendered into href/src must pass through these.
 */

const HTTP_RE = /^https?:\/\//i;

export const safeUrl = (url: string | null | undefined): string => {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (!HTTP_RE.test(trimmed)) return "#";
  return trimmed;
};

export const safeImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  if (!HTTP_RE.test(trimmed)) return undefined;
  return trimmed;
};
