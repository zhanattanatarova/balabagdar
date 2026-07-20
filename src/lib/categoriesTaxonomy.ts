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
    subs: ["early", "special", "afk", "aba", "sensory", "montessori", "logic", "memory", "mental_arithmetic", "reading", "emotional", "social", "fine_motor", "attention", "creativity_dev"],
  },
  {
    id: "sport", emoji: "🏆",
    subs: ["gymnastics", "rhythmic_gymnastics", "acrobatics", "karate", "judo", "taekwondo", "boxing", "kickboxing", "mma", "sambo", "wrestling", "aikido", "capoeira", "football", "basketball", "volleyball", "handball", "rugby", "tennis", "table_tennis", "badminton", "hockey", "chess", "checkers", "skating", "rollerskating", "skiing", "snowboard", "cycling", "athletics", "swimming", "climbing", "parkour", "yoga", "fencing", "equestrian", "shooting", "archery", "crossfit", "golf"],
  },
  {
    id: "creativity", emoji: "🎨",
    subs: ["drawing", "painting", "handicraft", "sculpting", "pottery", "origami", "embroidery", "knitting", "sewing", "beading", "theater", "cinema", "photography", "video", "animation", "design", "calligraphy", "graffiti", "cooking", "woodworking", "magic", "model_making", "3d_modeling"],
  },
  {
    id: "music", emoji: "🎵",
    subs: ["dombyra", "kobyz", "bayan", "vocals", "piano", "guitar", "ukulele", "violin", "cello", "harp", "drums", "flute", "saxophone", "accordion", "solfeggio", "theory", "composition", "dj", "choir", "jazz", "rock_band"],
  },
  {
    id: "dance", emoji: "💃",
    subs: ["ballet", "ballroom", "sport", "modern", "hiphop", "folk", "latin", "breakdance", "contemporary", "oriental", "jazz_funk", "kpop", "zumba"],
  },
  {
    id: "languages", emoji: "🌍",
    subs: ["english", "chinese", "french", "korean", "turkish", "kazakh", "russian", "german", "spanish", "arabic", "japanese", "italian", "portuguese", "hindi", "polish"],
  },
  {
    id: "tutors", emoji: "📚",
    subs: ["school_prep", "afterschool_1_4", "primary", "kazakh", "russian", "english", "math", "algebra", "geometry", "physics", "chemistry", "biology", "geography", "history", "world_history", "social_studies", "literature", "informatics", "economics", "ent", "nish", "ktl", "fizmat", "olympiad", "ielts", "sat"],
  },
  {
    id: "special", emoji: "💖",
    subs: ["asd", "zprr", "zrr", "onr", "adhd", "correction_center", "surdo", "tiflo", "afk", "lfk", "aba", "sensory", "psychologist", "neurologist", "massage", "osteopath", "swim", "hippotherapy", "canistherapy", "art", "music", "montessori", "inclusive"],
  },
  {
    id: "health", emoji: "🏥",
    subs: ["massage", "pediatrician", "nutritionist", "psychologist", "neurologist", "dentist", "ophthalmologist", "orthopedist", "speech_therapist", "defectologist", "lfk", "osteopath", "allergist", "ent", "vaccination"],
  },
  {
    id: "it", emoji: "💻",
    subs: ["programming", "scratch", "python", "web", "gamedev", "roblox", "minecraft", "ai", "data", "cybersec", "ux"],
  },
  {
    id: "robotics", emoji: "🤖", subs: [] },
  {
    id: "speech", emoji: "🗣️", subs: ["logoped", "logoped_defectolog", "logomassage"] },
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
  {
    id: "correction", emoji: "🧩", subs: [] },
  {
    id: "neuropsychology", emoji: "🧠", subs: [] },
  {
    id: "camp", emoji: "🏕️", subs: [] },
  {
    id: "scouts", emoji: "🧭", subs: [] },
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
