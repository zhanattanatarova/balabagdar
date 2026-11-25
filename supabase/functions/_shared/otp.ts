export const INVALID_CODE = "Неверный или просроченный код";
export const OTP_DIGITS = 6;
export const OTP_TTL_SECONDS = 300;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 60;

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  return digits;
}

export function generateCode(): string {
  const bytes = new Uint32Array(1);
  // Rejection sampling avoids modulo bias.
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= 4294000000);
  return String(bytes[0] % 1000000).padStart(OTP_DIGITS, "0");
}

export async function hashCode(phone: string, purpose: string, code: string, secret: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify([secret, phone, purpose, code])));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  return hashCode("ip", "verify", ip, secret);
}