export function getImageUrl(path?: string): string {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost";
    if (!path) return "/fallback.png"; // optional fallback

    if (path.startsWith("/")) {
        // If API_BASE ends with a slash and path starts with a slash,
        // remove the leading slash from 'path' to avoid double slashes.
        if (API_BASE.endsWith('/') && path.length > 0) {
            return `${API_BASE}${path.substring(1)}`;
        }
        // Otherwise, concatenate as is.
        return `${API_BASE}${path}`;
    }
    // If path doesn't start with "/", it's assumed to be an absolute URL or already correct.
    return path;
  }