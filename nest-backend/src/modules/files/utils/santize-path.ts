export function sanitizePath(path: string) {
  if (!path || typeof path !== "string") return "";
  let normalized = path.trim();

  if (normalized === "/") return "";

  // Ensure it only starts with / if its /
  if (normalized.startsWith("/") && normalized !== "/") {
    normalized = normalized.slice(1);
  }

  // Ensure it ends with /
  if (!normalized.endsWith("/")) {
    normalized += "/";
  }

  return normalized;
}