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

export function useTechnologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch("/api/technologies");
        if (response.ok) {
          const data = await response.json();
          setTechnologies(data.technologies || []);
          setError(null);
        } else {
          throw new Error("Failed to fetch technologies");
        }
      } catch (err) {
        console.error("Fetch technologies error:", err);
        setError("Failed to load technologies");
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

    setIsLoading(true);
    setError(null);

    try {
      const url = level
        ? `/api/technologies/${techId}/questions?level=${level}`
        : `/api/technologies/${techId}/questions`;

      const response = await fetch(url);
      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
      } else if (response.status === 404) {
        setError("Technology not found");
        setData(null);
      } else {
        throw new Error("Failed to fetch questions");
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      setError("Failed to load questions");
      setData(null);
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
