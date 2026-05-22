import { db } from "@workspace/db";
import { usersTable, clubsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function seedIfEmpty() {
  try {
    const existing = await db
      .select({ id: clubsTable.id })
      .from(clubsTable)
      .where(eq(clubsTable.id, "89f20083-45e0-4d8c-b3d0-7f4fc892f464"))
      .limit(1);
    if (existing.length > 0) return;
    logger.info("Seeding clubs data...");
    await seedProductionData();
  } catch (err) {
    logger.error({ err }, "Seed check failed (non-fatal)");
  }
}

async function seedProductionData() {
  try {
    await db
      .insert(usersTable)
      .values({
        id: "87467a97-634f-4be2-8421-59f0d47aad4b",
        phone: "77474807286",
        firstName: "Жанат",
        lastName: "Танатарова",
      })
      .onConflictDoNothing();

    const clubsData = [
      {
        id: "6d9cb4c4-6ab3-495d-bf9f-d0acbc4b99e5",
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Аси",
        category: "speech",
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
        id: "89f20083-45e0-4d8c-b3d0-7f4fc892f464",
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Baby Kids",
        nameKz: "Baby Kids",
        category: "development",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Центр Шабыт",
        nameKz: "Шабыт орталығы",
        category: "kindergarten",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Aqyl Junior — Образовательный центр",
        nameKz: "Aqyl Junior — Оқу орталығы",
        nameEn: "Aqyl Junior Learning Center",
        category: "development",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Сделай Шаг",
        nameKz: "Түзету және даму орталығы",
        category: "special",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "StudyMania — Английский язык",
        nameKz: "StudyMania — Ағылшын тілі",
        nameEn: "StudyMania English School",
        category: "languages",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Центр развития Мадина",
        nameKz: "Мадина даму орталығы",
        category: "development",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Art Shiko — Творческая студия",
        nameKz: "Art Shiko — Шығармашылық студиясы",
        category: "creativity",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "KonysToys — Развивающие игрушки",
        nameKz: "KonysToys — Дамытушы ойыншықтар",
        category: "shops",
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
        userId: "87467a97-634f-4be2-8421-59f0d47aad4b",
        nameRu: "Balapan — Образовательный центр",
        nameKz: "Balapan білім орталығы",
        category: "development",
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
    ] as const;

    for (const club of clubsData) {
      await db.insert(clubsTable).values(club as any).onConflictDoNothing();
    }

    logger.info("Production seed completed");
  } catch (err) {
    logger.error({ err }, "Seed error (non-fatal)");
  }
}
