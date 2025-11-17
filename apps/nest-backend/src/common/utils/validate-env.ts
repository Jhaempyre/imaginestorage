import { Logger } from "@nestjs/common";
import { plainToInstance, Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync
} from "class-validator";

export enum Environment {
  development = "development",
  production = "production",
  test = "test",
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  CORS_ORIGIN: string;

  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_EXPIRY: string; // "7d", "15m", etc.

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_EXPIRY: string;

  @IsNotEmpty()
  @IsString()
  EMAIL_HOST: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  EMAIL_PORT: number;

  @IsNotEmpty()
  @IsString()
  EMAIL_USER: string;

  @IsNotEmpty()
  @IsString()
  EMAIL_PASS: string;

  @IsNotEmpty()
  @IsString()
  EMAIL_FROM: string;

  // @IsNotEmpty()
  // @IsString()
  // ALLOWED_FILE_TYPES: string; // comma-separated, e.g. "jpg,png,pdf"

  @IsNotEmpty()
  @IsString()
  STORAGE_PROVIDER: string; // e.g., "aws", "gcp", "local"

  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  AWS_REGION: string;

  @IsNotEmpty()
  @IsString()
  AWS_S3_BUCKET: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  BCRYPT_SALT_ROUNDS: number;

  @IsNotEmpty()
  @IsString()
  SESSION_SECRET: string;

  @IsNotEmpty()
  @IsString()
  PROXY_URL: string;

  @IsNotEmpty()
  @IsString()
  SHARING_TOKEN_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const logger = new Logger("Env Validation");
  Object.keys(new EnvironmentVariables()).forEach((key) => {
    logger.log(`${key}: ${validatedConfig[key]}`);
    console.log(`${key}: ${validatedConfig[key]}`);

  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
