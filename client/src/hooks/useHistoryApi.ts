import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HistoryEntry {
  id: number;
  sessionId: string;
  questionId: number;
  questionText: string;
  techId: string;
  level: string;
  userAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
  chatMessages: ChatMessage[];
  model: string;
  createdAt: string;
}

export function useHistoryApi() {
  const { sessionId, isReady, getHeaders } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch history from API
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/history", {
        headers: { ...getHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        setError(null);
      } else {
        throw new Error("Failed to fetch history");
      }
    } catch (err) {
      console.error("Fetch history error:", err);
      setError("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, getHeaders]);

  // Load history when session is ready
  useEffect(() => {
    if (isReady && sessionId) {
      fetchHistory();
    }
  }, [isReady, sessionId, fetchHistory]);

  // Add new history entry
  const addEntry = useCallback(
    async (entry: Omit<HistoryEntry, "id" | "sessionId" | "createdAt">) => {
      if (!sessionId) return null;

      try {
        const response = await fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify(entry),
        });

        if (response.ok) {
          const data = await response.json();
          // Refresh history
          await fetchHistory();
          return data.entry?.id || null;
        }
        throw new Error("Failed to add history entry");
      } catch (err) {
        console.error("Add history error:", err);
        return null;
      }
    },
    [sessionId, getHeaders, fetchHistory]
  );

  // Update chat messages for an entry
  const updateChatMessages = useCallback(
    async (historyId: number, messages: ChatMessage[]) => {
      try {
        const response = await fetch(`/api/history/${historyId}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({ messages }),
        });

        if (response.ok) {
          // Update local state
          setHistory((prev) =>
            prev.map((entry) =>
              entry.id === historyId ? { ...entry, chatMessages: messages } : entry
            )
          );
        }
      } catch (err) {
        console.error("Update chat messages error:", err);
      }
    },
    [getHeaders]
  );

  // Get history for a specific question
  const getQuestionHistory = useCallback(
    (questionId: number) => {
      return history.filter((entry) => entry.questionId === questionId);
    },
    [history]
  );

  // Get all entries for a technology
  const getTechHistory = useCallback(
    (techId: string) => {
      return history.filter((entry) => entry.techId === techId);
    },
    [history]
  );

  // Delete a specific entry
  const deleteEntry = useCallback(
    async (historyId: number) => {
      try {
        const response = await fetch(`/api/history/${historyId}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        if (response.ok) {
          setHistory((prev) => prev.filter((entry) => entry.id !== historyId));
        }
      } catch (err) {
        console.error("Delete history error:", err);
      }
    },
    [getHeaders]
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Clear history error:", err);
    }
  }, [getHeaders]);

  // Check if a question has history
  const hasHistory = useCallback(
    (questionId: number) => {
      return history.some((entry) => entry.questionId === questionId);
    },
    [history]
  );

  // Get stats
  const getStats = useCallback(() => {
    const totalAnswers = history.length;
    const avgScore = totalAnswers > 0
      ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / totalAnswers)
      : 0;

    const scoreDistribution = {
      excellent: history.filter((e) => e.score >= 90).length,
      good: history.filter((e) => e.score >= 70 && e.score < 90).length,
      average: history.filter((e) => e.score >= 50 && e.score < 70).length,
      needsWork: history.filter((e) => e.score < 50).length,
    };

    const techCounts: Record<string, number> = {};
    history.forEach((e) => {
      techCounts[e.techId] = (techCounts[e.techId] || 0) + 1;
    });

    return { totalAnswers, avgScore, scoreDistribution, techCounts };
  }, [history]);

  return {
    history,
    isLoading,
    error,
    addEntry,
    updateChatMessages,
    getQuestionHistory,
    getTechHistory,
    deleteEntry,
    clearHistory,
    hasHistory,
    getStats,
    refetch: fetchHistory,
  };
}
