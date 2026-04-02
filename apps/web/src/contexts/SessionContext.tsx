import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const SESSION_KEY = "interview-prep-session-id";

interface SessionContextType {
  sessionId: string | null;
  isReady: boolean;
  getHeaders: () => Record<string, string>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initSession() {
      // Check localStorage for existing session
      let storedSessionId: string | null = localStorage.getItem(SESSION_KEY);

      try {
        // Verify or create session on server
        const response = await apiFetch("/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: storedSessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          storedSessionId = data.sessionId;
          if (storedSessionId) {
            localStorage.setItem(SESSION_KEY, storedSessionId);
          }
        } else if (!storedSessionId) {
          // Generate local session ID if server is unavailable
          storedSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(SESSION_KEY, storedSessionId);
        }
      } catch (error) {
        console.error("Failed to init session:", error);
        // Use local session ID
        if (!storedSessionId) {
          storedSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(SESSION_KEY, storedSessionId);
        }
      }

      setSessionId(storedSessionId);
      setIsReady(true);
    }

    initSession();
  }, []);

  const getHeaders = useCallback((): Record<string, string> => {
    if (!sessionId) return {};
    return { "X-Session-Id": sessionId };
  }, [sessionId]);

  return (
    <SessionContext.Provider value={{ sessionId, isReady, getHeaders }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
