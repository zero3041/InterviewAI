import javaQuestions from "@/data/questions.json";
import phpQuestions from "@/data/php_questions.json";
import reactQuestions from "@/data/react_questions.json";
import nextjsQuestions from "@/data/nextjs_questions.json";

export interface Question {
  number: number;
  text: string;
}

export interface CategoryData {
  level: string;
  categories: Record<string, Record<string, Question[]>>;
}

export interface FlatData {
  level: string;
  questions: Question[];
}

export type LevelData = CategoryData | FlatData;

export interface QuestionsData {
  junior: LevelData;
  middle: LevelData;
}

// Map technology IDs to their data
const dataMap: Record<string, QuestionsData> = {
  "java-springboot": javaQuestions as QuestionsData,
  "php": phpQuestions as QuestionsData,
  "react": reactQuestions as QuestionsData,
  "nextjs": nextjsQuestions as QuestionsData,
};

export function getQuestionsData(techId: string): QuestionsData | null {
  return dataMap[techId] || null;
}

export function getLevelData(techId: string, level: "junior" | "middle"): LevelData | null {
  const data = getQuestionsData(techId);
  if (!data) return null;
  return data[level] || null;
}

// Check if data has categories structure
export function hasCategories(data: LevelData): data is CategoryData {
  return "categories" in data;
}

// Get all questions from a level (works for both formats)
export function getAllQuestions(data: LevelData): Question[] {
  if (hasCategories(data)) {
    const questions: Question[] = [];
    Object.values(data.categories).forEach((subcats) => {
      Object.values(subcats).forEach((qs) => {
        questions.push(...qs);
      });
    });
    return questions;
  } else {
    return data.questions;
  }
}

// Count questions in a level
export function countQuestions(data: LevelData): number {
  return getAllQuestions(data).length;
}

// Count categories in a level
export function countCategories(data: LevelData): number {
  if (hasCategories(data)) {
    return Object.keys(data.categories).length;
  }
  return 1; // Flat structure has 1 "category"
}

// Convert flat structure to category structure for UI consistency
export function normalizeToCategories(data: LevelData): Record<string, Record<string, Question[]>> {
  if (hasCategories(data)) {
    return data.categories;
  } else {
    // Convert flat questions to a single category
    return {
      "Tất cả câu hỏi": {
        "Danh sách câu hỏi": data.questions,
      },
    };
  }
}
