import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class UploadCorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UploadCorsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`UploadCorsMiddleware triggered for: ${req.path}`); // Debug log

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Credentials", "false");

    if (req.method === "OPTIONS") {
      this.logger.debug("Handling OPTIONS request");
      return res.status(204).send();
    }

    next();
  }
}
