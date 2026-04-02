const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const apiUrl = (path: string) => `${baseUrl}/api${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = (path: string, init?: RequestInit) => fetch(apiUrl(path), init);
