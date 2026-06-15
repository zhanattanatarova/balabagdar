export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Разрешены только изображения (JPEG, PNG, WEBP, GIF)";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Файл больше 5 МБ";
  }
  return null;
};
