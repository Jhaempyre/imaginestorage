import jwt from "jsonwebtoken";

export function decodeJwtOrNull(token: string, secret: string) {
  try {
    return jwt.verify(token, secret) as Record<string, any>;
  } catch {
    return null;
  }
}
