import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { apiFetch } from "@/lib/api";

export interface BookmarkWithQuestion {
  id: number;
  questionId: number;
  createdAt: string;
  question: {
    id: number;
    techId: string;
    level: string;
    questionNumber: number;
    text: string;
  } | null;
}

export function useBookmarksApi() {
  const { sessionId, isReady, getHeaders } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkWithQuestion[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookmarks from API
  const fetchBookmarks = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const response = await apiFetch("/bookmarks", {
        headers: { ...getHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        const bookmarkList = data.bookmarks || [];
        setBookmarks(bookmarkList);
        setBookmarkIds(new Set(bookmarkList.map((b: BookmarkWithQuestion) => b.questionId)));
        setError(null);
      } else {
        throw new Error("Failed to fetch bookmarks");
      }
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
      setError("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, getHeaders]);

  // Load bookmarks when session is ready
  useEffect(() => {
    if (isReady && sessionId) {
      fetchBookmarks();
    }
  }, [isReady, sessionId, fetchBookmarks]);

  // Check if a question is bookmarked
  const isBookmarked = useCallback(
    (questionId: number) => {
      return bookmarkIds.has(questionId);
    },
    [bookmarkIds]
  );

  // Toggle bookmark
  const toggleBookmark = useCallback(
    async (questionId: number) => {
      if (!sessionId) return;

      const isCurrentlyBookmarked = bookmarkIds.has(questionId);

      try {
        if (isCurrentlyBookmarked) {
          // Remove bookmark
          const response = await apiFetch(`/bookmarks/${questionId}`, {
            method: "DELETE",
            headers: getHeaders(),
          });

          if (response.ok) {
            setBookmarkIds((prev) => {
              const next = new Set(prev);
              next.delete(questionId);
              return next;
            });
            setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
          }
        } else {
          // Add bookmark
          const response = await apiFetch("/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getHeaders(),
            },
            body: JSON.stringify({ questionId }),
          });

          if (response.ok) {
            setBookmarkIds((prev) => new Set(prev).add(questionId));
            // Refresh to get full bookmark data
            await fetchBookmarks();
          }
        }
      } catch (err) {
        console.error("Toggle bookmark error:", err);
      }
    },
    [sessionId, bookmarkIds, getHeaders, fetchBookmarks]
  );

  // Add bookmark
  const addBookmark = useCallback(
    async (questionId: number) => {
      if (bookmarkIds.has(questionId)) return;
      await toggleBookmark(questionId);
    },
    [bookmarkIds, toggleBookmark]
  );

  // Remove bookmark
  const removeBookmark = useCallback(
    async (questionId: number) => {
      if (!bookmarkIds.has(questionId)) return;
      await toggleBookmark(questionId);
    },
    [bookmarkIds, toggleBookmark]
  );

  return {
    bookmarks,
    bookmarkIds,
    isLoading,
    error,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
    refetch: fetchBookmarks,
  };
}
