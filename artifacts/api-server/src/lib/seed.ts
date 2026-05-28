import { db } from "@workspace/db";
import { usersTable, clubsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";

const OWNER_PHONE = "77474807286";

export async function seedIfEmpty() {
  try {
    const existing = await db
      .select({ id: clubsTable.id })
      .from(clubsTable)
      .where(eq(clubsTable.id, "efeeea53-0fe1-4765-8b59-8454b1d40043"))
      .limit(1);
    if (existing.length > 0) {
      logger.info("Seed: all clubs present, running tag fixes only");
      await applyFixes();
      return;
    }

    const userRow = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.phone, OWNER_PHONE))
      .limit(1);

    if (userRow.length === 0) {
      logger.warn({ phone: OWNER_PHONE }, "Seed: owner user not found, skipping");
      return;
    }

    const userId = userRow[0].id;
    logger.info({ userId }, "Seeding clubs data...");
    await seedData(userId);
  } catch (err) {
    logger.error({ err }, "Seed check failed (non-fatal)");
  }
}

async function applyFixes() {
  // Ensure tags column exists (idempotent migration for production)
  try {
    await db.execute(sql`ALTER TABLE clubs ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb`);
  } catch (e) {
    logger.warn({ e }, "Seed: tags column migration failed (non-fatal)");
  }

  const fixes: { id: string; category: string; subcategory: string | null; tags: string[] }[] = [
    { id: "a3b4a2bc-ec5c-481c-b8d7-ac7029f4d108", category: "sport",       subcategory: "gymnastics", tags: ["gymnastics"] },
    { id: "1e1cc406-8505-433d-933b-c6efa6d69d82", category: "special",     subcategory: "afk",        tags: ["afk", "speech", "aba", "sensory"] },
    { id: "c1b8f25b-c0fc-45ef-90f4-0181b4d05d7d", category: "development", subcategory: "afk",        tags: ["school_prep", "english", "afk", "sensory"] },
    { id: "5488da99-d39e-446b-886f-0e99236a70a9", category: "languages",   subcategory: "english",    tags: ["english"] },
    { id: "89f20083-45e0-4d8c-b3d0-7f4fc892f464", category: "development", subcategory: null,          tags: ["school_prep", "early"] },
    { id: "883cd05f-b813-4718-8983-2c5a13355ad0", category: "kindergarten",subcategory: null,          tags: ["early"] },
    { id: "0a67f10a-265f-4c6e-b56f-4bf0980669a2", category: "development", subcategory: null,          tags: ["early", "school_prep", "english", "speech"] },
    { id: "3ea8dd0b-fd1a-42aa-bc9f-3f160d462996", category: "development", subcategory: null,          tags: ["early", "school_prep"] },
    { id: "e8e0e013-a4e7-4c03-a70a-26f04c99ec26", category: "development", subcategory: null,          tags: ["school_prep"] },
    { id: "e2d7a6a8-1725-4977-9e03-433a9fd0a577", category: "creativity",  subcategory: null,          tags: ["drawing"] },
    { id: "efeeea53-0fe1-4765-8b59-8454b1d40043", category: "creativity",  subcategory: null,          tags: ["drawing", "art_therapy"] },
    { id: "6d9cb4c4-6ab3-495d-bf9f-d0acbc4b99e5", category: "speech",      subcategory: null,          tags: ["early", "speech"] },
    { id: "85cd3ed2-4a6a-459d-89e4-2a3f2ce6d2f9", category: "development", subcategory: "afk",         tags: ["school_prep", "afk", "speech", "english", "early", "dombra"] },
  ];
  for (const fix of fixes) {
    try {
      await db.update(clubsTable)
        .set({ category: fix.category, subcategory: fix.subcategory, tags: fix.tags } as any)
        .where(eq(clubsTable.id, fix.id));
    } catch (e) {
      logger.warn({ e, id: fix.id }, "Seed: fix update failed (non-fatal)");
    }
  }
  logger.info("Seed: tag fixes applied");
}

async function seedData(userId: string) {
  const clubs = [
    {
      id: "89f20083-45e0-4d8c-b3d0-7f4fc892f464",
      nameRu: "Baby Kids",
      nameKz: "Baby Kids",
      category: "development",
      tags: ["school_prep", "early"],
      city: "Актау",
      address: "19-43 АФК",
      phone: "+77018862266",
      instagram: "https://www.instagram.com/baby_kids.aktau/",
      ageMin: 3,
      ageMax: 7,
      priceFrom: 0,
      avatarUrl: "/avatars/baby-kids.png",
      descriptionRu: "Детский центр в Актау. Подготовка к школе (мектеп алды даярлық), развивающие занятия для детей.",
      descriptionKz: "Актаудағы балалар орталығы. Мектеп алды даярлық, балаларға арналған дамыту сабақтары.",
      isActive: true,
    },
    {
      id: "883cd05f-b813-4718-8983-2c5a13355ad0",
      nameRu: "Центр Шабыт",
      nameKz: "Шабыт орталығы",
      category: "kindergarten",
      tags: ["early"],
      city: "Актау",
      address: "Толкын 2, 47 дом",
      phone: "+77012778857",
      ageMin: 2,
      ageMax: 6,
      priceFrom: 0,
      avatarUrl: "/avatars/shabyt.png",
      descriptionRu: "Детский садик Шабыт в Актау.",
      descriptionKz: "Ақтаудағы Шабыт балабақшасы.",
      isActive: true,
    },
    {
      id: "0a67f10a-265f-4c6e-b56f-4bf0980669a2",
      nameRu: "Aqyl Junior — Образовательный центр",
      nameKz: "Aqyl Junior — Оқу орталығы",
      nameEn: "Aqyl Junior Learning Center",
      category: "development",
      tags: ["early", "school_prep", "english", "speech"],
      city: "Актау",
      address: "11 мкр, 3 дом",
      phone: "+77017776600",
      ageMin: 2,
      ageMax: 12,
      priceFrom: 0,
      avatarUrl: "/avatars/aqyl-junior.png",
      descriptionRu: "Образовательный центр Aqyl Junior в Актау. Мини-сад, Neuro Kids, логопед, подготовка к школе.",
      descriptionKz: "Aqyl Junior оқу орталығы. Мини-бақша, Neuro Kids, логопед, мектепке дайындық.",
      isActive: true,
    },
    {
      id: "1e1cc406-8505-433d-933b-c6efa6d69d82",
      nameRu: "Сделай Шаг",
      nameKz: "Түзету және даму орталығы",
      category: "special",
      subcategory: "afk",
      tags: ["afk", "speech", "aba", "sensory"],
      city: "Актау",
      address: "19а мкр, 22",
      instagram: "https://www.instagram.com/sdelai_shag.aktau/",
      ageMin: 2,
      ageMax: 18,
      priceFrom: 0,
      avatarUrl: "/avatars/sdelai-shag.png",
      descriptionRu: "Коррекционно-развивающий центр для детей с особенностями развития. Логопед-дефектолог, АФК, сенсорная интеграция (СИ), АВА-терапия.",
      descriptionKz: "Даму ерекшеліктері бар балаларға арналған түзету-дамыту орталығы. Логопед-дефектолог | АФК | СИ | АВА-терапия.",
      isActive: true,
    },
    {
      id: "5488da99-d39e-446b-886f-0e99236a70a9",
      nameRu: "StudyMania — Английский язык",
      nameKz: "StudyMania — Ағылшын тілі",
      nameEn: "StudyMania English School",
      category: "languages",
      subcategory: "english",
      tags: ["english"],
      city: "Жанаозен",
      phone: "+77029797290",
      instagram: "https://www.instagram.com/studymania.ozen/",
      ageMin: 5,
      ageMax: 18,
      priceFrom: 0,
      avatarUrl: "/avatars/studymania.png",
      descriptionRu: "Школа английского языка StudyMania в Жанаозене.",
      descriptionKz: "Жаңаөзендегі StudyMania ағылшын тілі мектебі.",
      isActive: true,
    },
    {
      id: "3ea8dd0b-fd1a-42aa-bc9f-3f160d462996",
      nameRu: "Центр развития Мадина",
      nameKz: "Мадина даму орталығы",
      category: "development",
      tags: ["early", "school_prep"],
      city: "Актау",
      address: "ЖК Акжелкен, мкр 32Б, 20",
      whatsapp: "+77085901060",
      instagram: "https://www.instagram.com/centr_razvitya_madina/",
      ageMin: 2,
      ageMax: 12,
      priceFrom: 0,
      avatarUrl: "/avatars/madina.png",
      descriptionRu: "Педагог, развивайка, продлёнка, мини-садик в ЖК Акжелкен, Актау.",
      descriptionKz: "Педагог, дамыту, күндізгі топ, мини-бақша. Ақтау, Акжелкен ЖК.",
      isActive: true,
    },
    {
      id: "e2d7a6a8-1725-4977-9e03-433a9fd0a577",
      nameRu: "Art Shiko — Творческая студия",
      nameKz: "Art Shiko — Шығармашылық студиясы",
      category: "creativity",
      tags: ["drawing"],
      city: "Актау",
      address: "16-64",
      phone: "+77752797486",
      instagram: "https://www.instagram.com/art_shiko_aktau/",
      ageMin: 4,
      ageMax: 99,
      priceFrom: 0,
      descriptionRu: "Творческая студия в Актау. Флористика (ұмыра жасау), рисование, гончарное дело, арт-терапия.",
      descriptionKz: "Ақтаудағы шығармашылық студия. Ұмыра жасау, сурет салу, гончарное дело, арт терапия.",
      isActive: true,
    },
    {
      id: "a99dbe26-b48e-4033-96a0-c8e234883cf2",
      nameRu: "KonysToys — Развивающие игрушки",
      nameKz: "KonysToys — Дамытушы ойыншықтар",
      category: "shops",
      tags: [],
      city: "Актау",
      address: "19 мкр, 25 дом",
      phone: "+77006614760",
      instagram: "https://www.instagram.com/konystoys/",
      ageMin: 0,
      ageMax: 99,
      priceFrom: 0,
      avatarUrl: "/avatars/konystoys.png",
      descriptionRu: "Магазин развивающих игрушек и мастерская «Создай игрушку» в Актау. ⏰ Работаем с 10:00 до 20:00.",
      descriptionKz: "Ақтаудағы дамытушы ойыншықтар дүкені және «Ойыншық жасау» шеберханасы. ⏰ 10:00 – 20:00.",
      isActive: true,
    },
    {
      id: "e8e0e013-a4e7-4c03-a70a-26f04c99ec26",
      nameRu: "Balapan — Образовательный центр",
      nameKz: "Balapan білім орталығы",
      category: "development",
      tags: ["school_prep"],
      city: "Актау",
      address: "ЖК Отырар Сити, 20 мкр, 24/1",
      phone: "+77009613235",
      instagram: "https://www.instagram.com/balapan.edu.kz/",
      ageMin: 3,
      ageMax: 7,
      priceFrom: 0,
      avatarUrl: "/avatars/balapan.png",
      descriptionRu: "Образовательный центр Balapan. Подготовка к школе.",
      descriptionKz: "Balapan білім орталығы. Мектепке дайындық.",
      isActive: true,
    },
    {
      id: "a3b4a2bc-ec5c-481c-b8d7-ac7029f4d108",
      nameRu: "Tolagai — Детская гимнастика и акробатика",
      nameKz: "Tolagai — Балалар гимнастикасы және акробатика",
      category: "sport",
      subcategory: "gymnastics",
      tags: ["gymnastics"],
      city: "Актау",
      address: "ЖК Premier Aktau, 19 мкр, 44, 1 этаж",
      phone: "+77752061123",
      instagram: "https://www.instagram.com/tolagai_aktau/",
      ageMin: 3,
      ageMax: 18,
      priceFrom: 0,
      avatarUrl: "/avatars/tolagai.png",
      descriptionRu: "Детская гимнастика и акробатика в Актау. ЖК Premier Aktau, 19 мкр, 44, 1 этаж.",
      descriptionKz: "Ақтаудағы балалар гимнастикасы және акробатика. Premier Aktau ЖК, 19 мкр, 44, 1 қабат.",
      isActive: true,
    },
    {
      id: "c1b8f25b-c0fc-45ef-90f4-0181b4d05d7d",
      nameRu: "SensoryUm",
      nameKz: "SensoryUm",
      category: "development",
      subcategory: "afk",
      tags: ["school_prep", "english", "afk", "sensory"],
      city: "Актау",
      address: "14-50, 1 этаж",
      phone: "+77052307515",
      instagram: "https://www.instagram.com/sensoryum_afk_aktau/",
      ageMin: 1,
      ageMax: 12,
      priceFrom: 0,
      avatarUrl: "/avatars/sensoryum.png",
      descriptionRu: "👶 Мини-сад: 1,6+\n📚 Мектепке дайындық\n⭐️ Ағылшын тілі\n💫 Жексенбілік топ\n🧠 Нейрокоррекция\n💪 АФК | Демалыс топтары",
      descriptionKz: "👶 Мини-бақша: 1,6+\n📚 Мектепке дайындық\n⭐️ Ағылшын тілі\n💫 Жексенбілік топ\n🧠 Нейрокоррекция\n💪 АФК | Демалыс топтары",
      isActive: true,
    },
    {
      id: "6d9cb4c4-6ab3-495d-bf9f-d0acbc4b99e5",
      nameRu: "Аси",
      category: "speech",
      tags: ["early", "speech"],
      city: "Актау",
      address: "15-101",
      phone: "+77027772047",
      ageMin: 0,
      ageMax: 3,
      priceFrom: 0,
      avatarUrl: "/api/storage/objects/uploads/aefb06f3-302b-43ce-8178-81196d0ce3cd",
      isActive: true,
    },
    {
      id: "efeeea53-0fe1-4765-8b59-8454b1d40043",
      nameRu: "Мастерская сестёр Туяковых",
      nameKz: "Туяковых апалар шеберханасы",
      category: "creativity",
      tags: ["drawing", "art_therapy"],
      city: "Актау",
      phone: "+77012975990",
      instagram: "https://www.instagram.com/sisters_tuyakovy/",
      ageMin: 4,
      ageMax: 99,
      priceFrom: 0,
      avatarUrl: "/avatars/sisters-tuyakovy.png",
      descriptionRu: "Арт-терапия и рисование в Актау. Творчество, которое объединяет.",
      descriptionKz: "Ақтаудағы арт-терапия және сурет салу. Шығармашылық — бәрін біріктіреді.",
      isActive: true,
    },
    {
      id: "85cd3ed2-4a6a-459d-89e4-2a3f2ce6d2f9",
      nameRu: "Smart Bala",
      nameKz: "Smart Bala",
      category: "development",
      subcategory: "afk",
      tags: ["school_prep", "afk", "speech", "english", "early", "dombra"],
      city: "Актау",
      address: "8-17",
      phone: "+77078822742",
      instagram: "https://www.instagram.com/smart_bala_aktau/",
      ageMin: 2,
      ageMax: 12,
      priceFrom: 0,
      avatarUrl: "/avatars/smart-bala.png",
      descriptionRu: "Продлёнка, мини-сад (логопед, дефектолог, АФК), английский и русский языки, домбыра.",
      descriptionKz: "Сабақтан кейінгі топ, мини-бақша (логопед, дефектолог, АФК), ағылшын, орыс тілдері, домбыра.",
      isActive: true,
    },
  ];

  let inserted = 0;
  let skipped = 0;
  for (const club of clubs) {
    try {
      const res = await db
        .insert(clubsTable)
        .values({ ...club, userId } as any)
        .onConflictDoNothing()
        .returning({ id: clubsTable.id });
      if (res.length > 0) inserted++;
      else skipped++;
    } catch (clubErr) {
      logger.error({ clubErr, clubId: club.id, clubName: club.nameRu }, "Seed: failed to insert club (skipping)");
      skipped++;
    }
  }

  await applyFixes();
  logger.info({ inserted, skipped }, "Seed completed");
}
