import dotenv from "dotenv";
import { appLogger } from "./logger";

export class EnvSetup {
  private static requiredVars = [
    "MONGODB_URI",
    "PORT",
    "SHARING_TOKEN_SECRET",
    "ACCESS_TOKEN_SECRET",
  ];

  public static loadDev() {
    if (process.env.NODE_ENV !== "production") {
      dotenv.config({ path: ".env.local" });
    }
  }

  public static validateRequiredEnvVars() {
    const env = process.env;
    const missingVars = EnvSetup.requiredVars.filter((varName) => {
      appLogger.debug(`Env var ${varName}: ${env[varName]}`);
      return !env[varName];
    });
    if (missingVars.length > 0) {
      appLogger.error(`Missing required environment variables: ${missingVars.join(", ")}`);
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }
  }
}
