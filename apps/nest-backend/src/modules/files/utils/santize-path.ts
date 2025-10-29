export function sanitizePath(path: string) {
  if (!path || typeof path !== "string") return "";

  // Trim whitespace
  let normalized = path.trim();

  // Remove leading slash if not root
  if (normalized.startsWith("/") && normalized !== "/") {
    normalized = normalized.slice(1);
  }

  // Replace consecutive slashes with single slash
  normalized = normalized.replace(/\/+/g, "/");

  // Ensure it ends with a single slash (if not empty)
  if (normalized && !normalized.endsWith("/")) {
    normalized += "/";
  }

  // Special case: if path is just "/", treat as empty (root)
  if (normalized === "/") return "";

  return normalized;
}
