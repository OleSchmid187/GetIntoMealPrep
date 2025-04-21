export function getImageUrl(path?: string): string {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (!path) return `${API_BASE}/fallback.png`;

  if (path.startsWith("http")) return path;

  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}