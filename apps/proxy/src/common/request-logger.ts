// // request-logger.ts
// import { Request, Response, NextFunction } from "express";
// import { Logger } from "./logger";
// import chalk from "chalk";

import { NextFunction, Request, Response } from "express";
import { Logger } from "./logger";

// const log = new Logger("HTTP");

// export function requestLogger(req: Request, res: Response, next: NextFunction) {
//   const start = Date.now();

//   const method = chalk.blue(req.method);
//   const url = chalk.green(req.originalUrl);

//   const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
//   const ua = req.headers["user-agent"] ?? "";

//   log.log(`${method} ${url} ${JSON.stringify({ ip, ua })}`);

//   // OPTIONAL: log Range header (file streaming relevance)
//   if (req.headers.range) {
//     log.debug(`Range: ${req.headers.range}`);
//   }

//   // Hook into response end
//   const originalEnd = res.end;
//   let bytesSent = 0;

//   res.end = function (...args: any[]) {
//     // Track bytes (if args contain a buffer)
//     if (args[0] && args[0].length) {
//       bytesSent += args[0].length;
//     }

//     const duration = Date.now() - start;
//     const statusColor =
//       res.statusCode >= 500
//         ? chalk.red
//         : res.statusCode >= 400
//         ? chalk.yellow
//         : chalk.green;

//     const status = statusColor(res.statusCode.toString());

//     log.log(
//       `${method} ${url} → ${status} ${chalk.gray(
//         duration + "ms"
//       )} ${JSON.stringify({
//         bytesSent,
//         user: (req as any).user?._id ?? null,
//       })}`
//     );

//     return originalEnd.apply(this, args as any);
//   };

//   next();
// }


const log = new Logger("HTTP");

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  const method = (req.method);
  const url = (req.originalUrl);

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"] ?? "";

  log.log(`${method} ${url} ${JSON.stringify({ ip, ua })}`);

  // OPTIONAL: log Range header (file streaming relevance)
  if (req.headers.range) {
    log.debug(`Range: ${req.headers.range}`);
  }

  // Hook into response end
  const originalEnd = res.end;
  let bytesSent = 0;

  res.end = function (...args: any[]) {
    // Track bytes (if args contain a buffer)
    if (args[0] && args[0].length) {
      bytesSent += args[0].length;
    }

    const duration = Date.now() - start;

    const status = (res.statusCode.toString());

    log.log(
      `${method} ${url} → ${status} ${(
        duration + "ms"
      )} ${JSON.stringify({
        bytesSent,
        user: (req as any).user?._id ?? null,
      })}`
    );

    return originalEnd.apply(this, args as any);
  };

  next();
}
