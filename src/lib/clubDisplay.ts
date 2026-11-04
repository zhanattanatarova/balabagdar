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

/** Old clubs were saved with the database default 3–18, which is not real data. */
export function hasRealAge(ageMin: number | null | undefined, ageMax: number | null | undefined) {
  if (ageMin == null && ageMax == null) return false;
  if (ageMin === 3 && ageMax === 18) return false;
  return true;
}

export function clubAge(ageMin: number | null | undefined, ageMax: number | null | undefined, lang: string) {
  if (!hasRealAge(ageMin, ageMax)) {
    return lang === "kz" ? "Жасын нақтылаңыз" : lang === "en" ? "Ask about age" : "Возраст уточняйте";
  }
  const suffix = lang === "kz" ? "жас" : lang === "en" ? "yrs" : "лет";
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} ${suffix}`;
  if (ageMin != null) return `${ageMin}+ ${suffix}`;
  return `${ageMax} ${suffix}`;
}

export function clubPrice(price: number | null | undefined, currency: string | null | undefined, lang: string) {
  if (price == null || !(price > 0)) return "";
  const cur = currency || "₸";
  const amount = price.toLocaleString(lang === "en" ? "en-US" : "ru-RU");
  if (lang === "kz") return `${amount} ${cur} бастап`;
  if (lang === "en") return `from ${amount} ${cur}`;
  return `от ${amount} ${cur}`;
}

/** Removes duplicated category ids (keeps first occurrence order). */
export function uniqueCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of categories) {
    const v = String(c ?? "").trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export function clubCategoryLabels(
  categories: unknown,
  translate: (key: any) => string,
  limit = 2,
) {
  const result: { id: string; label: string }[] = [];
  const seenLabels = new Set<string>();
  for (const value of uniqueCategories(categories)) {
    const key = value.includes(".") ? value : `cat.${value}`;
    const translated = translate(key);
    const label = translated === key ? value : translated;
    const norm = label.trim().toLocaleLowerCase();
    if (seenLabels.has(norm)) continue;
    seenLabels.add(norm);
    result.push({ id: value, label });
    if (result.length >= limit) break;
  }
  return result;
}
