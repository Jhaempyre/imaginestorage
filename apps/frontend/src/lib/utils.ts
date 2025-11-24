import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActualPath(fullPath: string): string {
  // Remove the first 4 characters (e.g., "usr/")
  return fullPath.startsWith("_rt") ? fullPath.slice(4) : fullPath;
}
