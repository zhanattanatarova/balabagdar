import type { EventKind } from "@/lib/events";
type L = "ru" | "kz" | "en";
export const KIND_LABELS: Record<EventKind, Record<L, string>> = {
  masterclass: { ru: "Мастер-класс", kz: "Шеберлік сабағы", en: "Workshop" },
  holiday: { ru: "Праздник", kz: "Мереке", en: "Celebration" },
  show: { ru: "Спектакль/концерт", kz: "Спектакль/концерт", en: "Show/concert" },
  competition: { ru: "Соревнование", kz: "Жарыс", en: "Competition" },
  exhibition: { ru: "Выставка", kz: "Көрме", en: "Exhibition" },
  other: { ru: "Другое", kz: "Басқа", en: "Other" },
};
