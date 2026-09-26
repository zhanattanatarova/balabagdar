const transliterationMap: Record<string, string> = {
  а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "e",
  ж: "zh", з: "z", и: "i", й: "i", к: "k", қ: "k", л: "l", м: "m", н: "n",
  ң: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u",
  ү: "u", ф: "f", х: "h", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ы: "y", і: "i", э: "e", ю: "yu", я: "ya", ь: "", ъ: "",
};

function normalizePlace(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase()
    .split("")
    .map((character) => transliterationMap[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

export function clubLocation(city: string | null | undefined, address: string | null | undefined) {
  const cleanCity = city?.trim() || "";
  const cleanAddress = address?.trim() || "";
  if (!cleanAddress || normalizePlace(cleanAddress) === normalizePlace(cleanCity)) return cleanCity;
  if (!cleanCity) return cleanAddress;
  return `${cleanCity}, ${cleanAddress}`;
}

export function clubAge(ageMin: number | null | undefined, ageMax: number | null | undefined, lang: string) {
  if (ageMin == null && ageMax == null) return "";
  const suffix = lang === "kz" ? "жас" : lang === "en" ? "yrs" : "лет";
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} ${suffix}`;
  if (ageMin != null) return `${ageMin}+ ${suffix}`;
  return `${ageMax} ${suffix}`;
}

export function clubCategoryLabels(
  categories: unknown,
  translate: (key: any) => string,
  limit = 2,
) {
  if (!Array.isArray(categories)) return [];
  return categories.slice(0, limit).map((id) => {
    const value = String(id);
    const key = value.includes(".") ? value : `cat.${value}`;
    const label = translate(key);
    return { id: value, label: label === key ? value : label };
  });
}