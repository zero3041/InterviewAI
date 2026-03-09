import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HistoryEntry {
  id: string;
  questionId: string; // techId + level + questionNumber
  questionText: string;
  technology: string;
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
  timestamp: number;
}

const HISTORY_KEY = "answer-score-history";
const MAX_HISTORY_ENTRIES = 500; // Limit to prevent localStorage overflow

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage
  const saveToStorage = useCallback((entries: HistoryEntry[]) => {
    try {
      // Keep only recent entries to prevent overflow
      const trimmed = entries.slice(0, MAX_HISTORY_ENTRIES);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, []);

  // Add new entry to history
  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const updated = [newEntry, ...prev];
        saveToStorage(updated);
        return updated;
      });

      return newEntry.id;
    },
    [saveToStorage]
  );

  // Update chat messages for an entry
  const updateChatMessages = useCallback(
    (entryId: string, chatMessages: ChatMessage[]) => {
      setHistory((prev) => {
        const updated = prev.map((entry) =>
          entry.id === entryId ? { ...entry, chatMessages } : entry
        );
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Get history for a specific question
  const getQuestionHistory = useCallback(
    (questionId: string) => {
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
    (entryId: string) => {
      setHistory((prev) => {
        const updated = prev.filter((entry) => entry.id !== entryId);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Check if a question has history
  const hasHistory = useCallback(
    (questionId: string) => {
      return history.some((entry) => entry.questionId === questionId);
    },
    [history]
  );

  // Get statistics
  const getStats = useCallback(() => {
    const totalEntries = history.length;
    const avgScore =
      totalEntries > 0
        ? Math.round(history.reduce((sum, e) => sum + e.score, 0) / totalEntries)
        : 0;
    const technologies = Array.from(new Set(history.map((e) => e.techId)));

    return { totalEntries, avgScore, technologies };
  }, [history]);

  return {
    history,
    addEntry,
    updateChatMessages,
    getQuestionHistory,
    getTechHistory,
    deleteEntry,
    clearHistory,
    hasHistory,
    getStats,
  };
}

// Generate a consistent question ID
export function generateQuestionId(
  techId: string,
  level: string,
  questionNumber: number
): string {
  return `${techId}-${level}-${questionNumber}`;
}
