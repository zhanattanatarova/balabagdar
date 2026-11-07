/** KZ phone normalisation shared by every tel:/wa.me link. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  if (d.length !== 11 || !d.startsWith("7")) return null;
  if (/^7?0+$/.test(d) || /^(\d)\1+$/.test(d.slice(1))) return null;
  return d;
}

export const telHref = (raw: string | null | undefined) => {
  const d = normalizePhone(raw);
  return d ? `tel:+${d}` : null;
};

export const waNumber = (raw: string | null | undefined) => normalizePhone(raw);

/** Kazakhstan mobile numbers start with +7 7XX. */
export const isMobilePhone = (raw: string | null | undefined) => {
  const d = normalizePhone(raw);
  return !!d && /^7(70[0-8]|747|75[01]|76[0-4]|771|77[5-8])/.test(d);
};

export const formatPhone = (raw: string | null | undefined) => {
  const d = normalizePhone(raw);
  if (!d) return null;
  return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
};
