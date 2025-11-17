import { Request } from "express";
import { appLogger } from "../common/logger";

export function extractToken(req: Request) {
  // Query token = sharing token
  if (req.query?.token) {
    appLogger.log(
      `Found sharing token in query: ${(req?.query?.token as string)?.slice?.(
        0,
        10
      )}...`
    );
    return {
      type: "sharing" as const,
      token: String(req.query.token),
    };
  }

  // Header or cookie = access token
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    appLogger.log(`Found access token in header: ${header?.slice?.(7)}`);
    return {
      type: "access" as const,
      token: header.slice(7),
    };
  }

  if (req.cookies?.accessToken) {
    appLogger.log(
      `Found access token in cookie: ${(
        req?.cookies?.accessToken as string
      )?.slice?.(0, 10)}...`
    );
    return {
      type: "access" as const,
      token: req.cookies.accessToken,
    };
  }


  appLogger.log(`No token found in request`);
  return null;
}
