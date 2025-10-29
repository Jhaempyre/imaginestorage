import type { NormalizedError } from "../error";

export function isNormalizedError(
  error: unknown
): error is NormalizedError {
  return (!!error && typeof error === "object");
}