import type { AxiosError } from "axios";

export function isAxiosErrorWithMessage(
  error: unknown
): error is AxiosError<{ message: string }> {
  return (
    !!error &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}