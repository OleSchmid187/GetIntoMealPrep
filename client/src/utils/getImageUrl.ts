export function getImageUrl(path?: string): string {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost";
    if (!path) return "/fallback.png"; // optional fallback
    return path.startsWith("/") ? `${API_BASE}${path}` : path;
  }