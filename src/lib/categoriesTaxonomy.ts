// Shared category taxonomy. Top-level groups + detailed subcategories.
// Stored in DB as namespaced ids: e.g. "sport.football", "languages.english".
// Top-level groups without sub-options are stored as themselves: e.g. "robotics".

export type Group = {
  id: string;        // top-level category id (matches "cat.<id>" translation key)
  emoji: string;
  subs: string[];    // subcategory ids (match "<id>.<sub>" translation key); empty = no subs
};

export const TAXONOMY: Group[] = [
  {
    id: "development", emoji: "🧠",
    subs: ["early", "special", "afk", "aba", "sensory", "montessori", "logic", "memory", "mental_arithmetic", "reading", "emotional", "social", "fine_motor"],
  },
  {
    id: "sport", emoji: "🏆",
    subs: ["gymnastics", "karate", "judo", "taekwondo", "boxing", "wrestling", "football", "basketball", "volleyball", "tennis", "hockey", "chess", "skating", "cycling", "athletics"],
  },
  {
    id: "creativity", emoji: "🎨",
    subs: ["drawing", "painting", "handicraft", "sculpting", "pottery", "origami", "embroidery", "knitting", "sewing", "theater", "cinema", "photography", "design", "calligraphy", "cooking"],
  },
  {
    id: "music", emoji: "🎵",
    subs: ["dombyra", "kobyz", "vocals", "piano", "guitar", "violin", "drums", "flute", "saxophone", "accordion", "cello", "solfeggio", "theory", "dj", "choir"],
  },
  {
    id: "dance", emoji: "💃",
    subs: ["ballet", "ballroom", "sport", "modern", "hiphop", "folk", "latin", "breakdance", "contemporary", "oriental"],
  },
  {
    id: "languages", emoji: "🌍",
    subs: ["english", "chinese", "french", "korean", "turkish", "kazakh", "russian", "german", "spanish", "arabic", "japanese", "italian"],
  },
  {
    id: "tutors", emoji: "📚",
    subs: ["school_prep", "primary", "kazakh", "russian", "english", "math", "algebra", "geometry", "physics", "chemistry", "biology", "geography", "history", "literature", "informatics", "ent", "nish", "ktl", "fizmat", "olympiad"],
  },
  {
    id: "special", emoji: "💖",
    subs: ["afk", "lfk", "aba", "sensory", "speech", "psychologist", "neurologist", "massage", "osteopath", "swim", "hippotherapy", "canistherapy", "art", "music", "montessori", "inclusive"],
  },
  {
    id: "health", emoji: "🏥",
    subs: ["massage", "pediatrician", "nutritionist", "psychologist", "neurologist", "dentist", "ophthalmologist", "orthopedist", "speech_therapist", "defectologist", "lfk", "osteopath", "allergist", "ent", "vaccination"],
  },
  {
    id: "robotics", emoji: "🤖", subs: [] },
  {
    id: "speech", emoji: "🗣️", subs: [] },
  {
    id: "swim", emoji: "🏊", subs: [] },
  {
    id: "shops", emoji: "🛍️", subs: [] },
  {
    id: "mini_garden", emoji: "🧸", subs: [] },
  {
    id: "garden", emoji: "🏫", subs: [] },
  {
    id: "school", emoji: "🎓", subs: [] },
  // Extra ad-hoc ones the user mentioned that map to existing groups
];

// All stored ids for a given top-level group (group itself + every namespaced sub).
export function idsForGroup(groupId: string): string[] {
  const g = TAXONOMY.find((x) => x.id === groupId);
  if (!g) return [groupId];
  return [groupId, ...g.subs.map((s) => `${groupId}.${s}`)];
}

// Derive top-level group id from a stored category id ("sport.football" -> "sport").
export function topGroup(catId: string): string {
  return catId.includes(".") ? catId.split(".")[0] : catId;
}
