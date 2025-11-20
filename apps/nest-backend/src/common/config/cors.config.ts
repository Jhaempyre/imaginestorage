// src/config/cors.config.ts
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

export class CorsConfig {
  /**
   * FULLY_OPEN_ROUTES: Automatically respond to OPTIONS with * headers
   * No controller involvement - middleware handles everything
   */
  private static readonly FULLY_OPEN_ROUTES = [
    "/api/upload*", // POST /api/upload (file upload)
    "/api/api-keys*",
  ];

  /**
   * CONTROLLER_MANAGED_ROUTES: Set permissive headers but let controller handle OPTIONS
   * Useful when you need custom origin validation or logging
   */
  private static readonly CONTROLLER_MANAGED_ROUTES = [
    // "/api/upload/token", // Custom token validation
  ];

  private static readonly ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
  ];

  static configureApp(app: INestApplication, configService: ConfigService) {
    // Middleware for both categories of permissive routes
    app.use((req, res, next) => {
      // debugger;
      const isFullyOpen = this.matchesRoute(req.path, this.FULLY_OPEN_ROUTES);
      const isControllerManaged = this.matchesRoute(
        req.path,
        this.CONTROLLER_MANAGED_ROUTES,
      );

      if (isFullyOpen) {
        // Set permissive headers
        this.setPermissiveHeaders(res);

        // Respond immediately to OPTIONS - don't let it reach controller
        if (req.method === "OPTIONS") {
          console.log(
            `✅ [FULLY OPEN] Auto-responding to OPTIONS: ${req.path}`,
          );
          return res.status(204).end();
        }
      } else if (isControllerManaged) {
        // Set permissive headers as a base
        this.setPermissiveHeaders(res);

        // But let the request continue to controller for OPTIONS
        if (req.method === "OPTIONS") {
          console.log(
            `🎯 [CONTROLLER MANAGED] Passing OPTIONS to controller: ${req.path}`,
          );
        }
        // Don't return, let it pass through
      }

      next();
    });

    // Global CORS for protected routes
    app.enableCors({
      origin: [
        ...this.ALLOWED_ORIGINS,
        ...(configService.get("CORS_ORIGIN")?.split(",").filter(Boolean) || []),
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });
  }

  /**
   * Pattern matching with wildcard support
   * Supports: /api/upload*, /api/*\/admin, :params
   */
  private static matchesRoute(path: string, routes: string[]): boolean {
    return routes.some((route) => {
      // Convert pattern to regex
      const regexPattern = route
        .replace(/\*/g, ".*") // * becomes .*
        .replace(/\//g, "\\/") // escape slashes
        .replace(/:\w+/g, "[^/]+"); // :param becomes [^/]+

      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(path);
    });
  }

  private static setPermissiveHeaders(res: Response) {
    const origin = res.req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    // res.header("Access-Control-Allow-Headers", "*");
    // res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }
}
