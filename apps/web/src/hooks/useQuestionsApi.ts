import technologiesConfig from "@/data/technologies.json";
import { apiFetch } from "@/lib/api";
import { getLevelData, normalizeToCategories } from "@/lib/questionsData";
import { useState, useEffect, useCallback } from "react";

export interface Technology {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  levels: string[];
}

export interface Question {
  id: number;
  techId: string;
  level: string;
  categoryId: number | null;
  questionNumber: number;
  text: string;
}

export interface QuestionsResponse {
  technology: Technology;
  level: string;
  levelLabel: string;
  categories: Record<string, Record<string, Question[]>>;
  questions: Question[];
  totalQuestions: number;
}

interface TechnologiesConfigFile {
  technologies: Array<Technology & { dataFile?: string }>;
}

type SupportedLevel = "junior" | "middle";

const LEVEL_LABELS: Record<SupportedLevel, string> = {
  junior: "Junior (1 năm kinh nghiệm)",
  middle: "Middle (2-3 năm kinh nghiệm)",
};

const LOCAL_TECHNOLOGIES = (technologiesConfig as TechnologiesConfigFile).technologies.map(
  ({ dataFile: _dataFile, ...technology }) => technology
);

let preferLocalQuestionBank = false;

function isSupportedLevel(level: string): level is SupportedLevel {
  return level === "junior" || level === "middle";
}

function buildFallbackQuestionId(techId: string, level: string, questionNumber: number) {
  const key = `${techId}:${level}:${questionNumber}`;
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 2_147_483_647;
  }

  return hash || questionNumber;
}

function getFallbackTechnologies() {
  return LOCAL_TECHNOLOGIES;
}

function getFallbackQuestionsResponse(
  techId: string,
  level: string | null
): QuestionsResponse | null {
  const technology = LOCAL_TECHNOLOGIES.find((item) => item.id === techId);
  if (!technology) {
    return null;
  }

  const requestedLevels = level
    ? isSupportedLevel(level)
      ? [level]
      : []
    : technology.levels.filter(isSupportedLevel);

  const categories: Record<string, Record<string, Question[]>> = {};
  const questions: Question[] = [];

  requestedLevels.forEach((currentLevel) => {
    const levelData = getLevelData(techId, currentLevel);
    if (!levelData) {
      return;
    }

    const normalizedCategories = normalizeToCategories(levelData);

    Object.entries(normalizedCategories).forEach(([categoryName, subcategories]) => {
      categories[categoryName] ??= {};

      Object.entries(subcategories).forEach(([subcategoryName, items]) => {
        const mappedQuestions = items.map((question) => ({
          id: buildFallbackQuestionId(techId, currentLevel, question.number),
          techId,
          level: currentLevel,
          categoryId: null,
          questionNumber: question.number,
          text: question.text,
        }));

        categories[categoryName][subcategoryName] = [
          ...(categories[categoryName][subcategoryName] ?? []),
          ...mappedQuestions,
        ];
        questions.push(...mappedQuestions);
      });
    });
  });

  return {
    technology,
    level: level || "all",
    levelLabel: level && isSupportedLevel(level) ? LEVEL_LABELS[level] : "All levels",
    categories,
    questions,
    totalQuestions: questions.length,
  };
}

export function useTechnologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTechnologies() {
      if (preferLocalQuestionBank) {
        setTechnologies(getFallbackTechnologies());
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiFetch("/technologies");
        if (response.ok) {
          const data = await response.json();
          setTechnologies(data.technologies || []);
          setError(null);
        } else {
          throw new Error("Failed to fetch technologies");
        }
      } catch {
        preferLocalQuestionBank = true;
        const fallbackTechnologies = getFallbackTechnologies();

        if (fallbackTechnologies.length > 0) {
          setTechnologies(fallbackTechnologies);
          setError(null);
        } else {
          setError("Failed to load technologies");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchTechnologies();
  }, []);

  return { technologies, isLoading, error };
}

export function useQuestions(techId: string | null, level: string | null) {
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!techId) {
      setData(null);
      return;
    }

    const fallbackResponse = getFallbackQuestionsResponse(techId, level);

    if (preferLocalQuestionBank && fallbackResponse) {
      setData(fallbackResponse);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = level
        ? `/technologies/${techId}/questions?level=${level}`
        : `/technologies/${techId}/questions`;

      const response = await apiFetch(url);
      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
      } else if (response.status === 404 && !fallbackResponse) {
        setError("Technology not found");
        setData(null);
      } else {
        throw new Error("Failed to fetch questions");
      }
    } catch {
      if (fallbackResponse) {
        preferLocalQuestionBank = true;
        setData(fallbackResponse);
        setError(null);
      } else {
        setError("Failed to load questions");
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [techId, level]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    data,
    technology: data?.technology || null,
    categories: data?.categories || {},
    questions: data?.questions || [],
    totalQuestions: data?.totalQuestions || 0,
    levelLabel: data?.levelLabel || "",
    isLoading,
    error,
    refetch: fetchQuestions,
  };
}

// Helper to get random questions for test mode
export function getRandomQuestions(questions: Question[], count: number): Question[] {
  if (questions.length <= count) return [...questions];

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
