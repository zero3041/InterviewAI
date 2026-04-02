import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as schema from "./schema";

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/interview_prep";
const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

// Path to data files
const DATA_DIR = resolve(process.cwd(), "apps/web/src/data");

interface QuestionData {
  number: number;
  text: string;
}

interface CategoryData {
  level: string;
  categories: Record<string, Record<string, QuestionData[]>>;
}

interface FlatData {
  level: string;
  questions: QuestionData[];
}

type LevelData = CategoryData | FlatData;

interface QuestionsFile {
  junior: LevelData;
  middle: LevelData;
}

interface TechnologyConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  levels: string[];
  dataFile: string;
}

interface TechnologiesFile {
  technologies: TechnologyConfig[];
}

function hasCategories(data: LevelData): data is CategoryData {
  return "categories" in data;
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Load technologies config
    const technologiesPath = resolve(DATA_DIR, "technologies.json");
    const technologiesFile: TechnologiesFile = JSON.parse(readFileSync(technologiesPath, "utf-8"));

    // Clear existing data in reverse order of dependencies
    console.log("🗑️  Clearing existing data...");
    await db.delete(schema.chatMessages);
    await db.delete(schema.bookmarks);
    await db.delete(schema.answerHistory);
    await db.delete(schema.sessions);
    await db.delete(schema.questions);
    await db.delete(schema.categories);
    await db.delete(schema.technologies);
    console.log("   Done!\n");

    // Insert technologies
    console.log("📚 Inserting technologies...");
    for (const tech of technologiesFile.technologies) {
      await db.insert(schema.technologies).values({
        id: tech.id,
        name: tech.name,
        icon: tech.icon,
        description: tech.description,
        color: tech.color,
        levels: tech.levels,
      });
      console.log(`   ✓ ${tech.name}`);
    }
    console.log("");

    // Process each technology's questions
    for (const tech of technologiesFile.technologies) {
      const questionsPath = resolve(DATA_DIR, `${tech.dataFile}.json`);
      console.log(`\n📖 Processing ${tech.name}...`);

      let questionsFile: QuestionsFile;
      try {
        questionsFile = JSON.parse(readFileSync(questionsPath, "utf-8"));
      } catch (err) {
        console.log(`   ⚠️  Could not load ${tech.dataFile}.json, skipping...`);
        continue;
      }

      // Process each level (junior, middle)
      for (const level of tech.levels) {
        const levelData = questionsFile[level as keyof QuestionsFile];
        if (!levelData) {
          console.log(`   ⚠️  No ${level} data found`);
          continue;
        }

        let questionsInserted = 0;

        if (hasCategories(levelData)) {
          // Hierarchical structure with categories
          let categoryOrder = 0;

          for (const [mainCategory, subCategories] of Object.entries(levelData.categories)) {
            for (const [subCategory, questions] of Object.entries(subCategories)) {
              // Insert category
              const [insertedCategory] = await db.insert(schema.categories).values({
                techId: tech.id,
                level,
                mainCategory,
                subCategory,
                displayOrder: categoryOrder++,
              }).returning();

              // Insert questions for this category
              for (const q of questions) {
                await db.insert(schema.questions).values({
                  techId: tech.id,
                  level,
                  categoryId: insertedCategory.id,
                  questionNumber: q.number,
                  text: q.text,
                });
                questionsInserted++;
              }
            }
          }
        } else {
          // Flat structure (no categories)
          // Create a default category
          const [defaultCategory] = await db.insert(schema.categories).values({
            techId: tech.id,
            level,
            mainCategory: "Tất cả câu hỏi",
            subCategory: "Danh sách câu hỏi",
            displayOrder: 0,
          }).returning();

          // Insert questions
          for (const q of levelData.questions) {
            await db.insert(schema.questions).values({
              techId: tech.id,
              level,
              categoryId: defaultCategory.id,
              questionNumber: q.number,
              text: q.text,
            });
            questionsInserted++;
          }
        }

        console.log(`   ✓ ${level}: ${questionsInserted} questions`);
      }
    }

    console.log("\n\n✅ Database seed completed successfully!");

    // Print summary
    const techCount = await db.select().from(schema.technologies);
    const categoryCount = await db.select().from(schema.categories);
    const questionCount = await db.select().from(schema.questions);

    console.log("\n📊 Summary:");
    console.log(`   Technologies: ${techCount.length}`);
    console.log(`   Categories: ${categoryCount.length}`);
    console.log(`   Questions: ${questionCount.length}`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seed
seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
