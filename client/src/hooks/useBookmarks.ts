import { useState, useEffect } from "react";

export function useBookmarks() {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    if (saved) {
      try {
        setBookmarkedQuestions(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load bookmarks:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bookmarkedQuestions", JSON.stringify(Array.from(bookmarkedQuestions)));
    }
  }, [bookmarkedQuestions, isLoaded]);

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionId)) {
        updated.delete(questionId);
      } else {
        updated.add(questionId);
      }
      return updated;
    });
  };

  const isBookmarked = (questionId: string) => bookmarkedQuestions.has(questionId);

  return {
    bookmarkedQuestions,
    toggleBookmark,
    isBookmarked,
    isLoaded,
  };
}
