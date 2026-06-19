export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Inspect the file's magic bytes (file signature) rather than trusting
// the browser-provided `file.type`. This prevents users from renaming an
// HTML/JS file to .jpg and uploading it as an "image".
const sniffImageMime = async (file: File): Promise<string | null> => {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
  // JPEG: FFD8FF
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  // PNG: 89504E470D0A1A0A
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  // GIF87a / GIF89a
  if (hex.startsWith("474946383761") || hex.startsWith("474946383961")) return "image/gif";
  // WEBP: "RIFF" .... "WEBP"
  if (hex.startsWith("52494646") && buf.length >= 12) {
    const tag = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
    if (tag === "WEBP") return "image/webp";
  }
  return null;
};

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Разрешены только изображения (JPEG, PNG, WEBP, GIF)";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Файл больше 5 МБ";
  }
  return null;
};

// Async version that also verifies real file content (magic bytes).
// Returns the sniffed safe MIME type or an error message string on failure.
export const validateImageFileDeep = async (
  file: File
): Promise<{ mime: string } | { error: string }> => {
  const err = validateImageFile(file);
  if (err) return { error: err };
  const sniffed = await sniffImageMime(file);
  if (!sniffed || !ALLOWED_IMAGE_TYPES.includes(sniffed)) {
    return { error: "Содержимое файла не является поддерживаемым изображением" };
  }
  return { mime: sniffed };
};
