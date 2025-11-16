import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { FilesModule } from "./modules/files/files.module";
import { StorageModule } from "./modules/storage/storage.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { ShellModule } from "./modules/shell/shell.module";
import { ApiKeysModule } from "./modules/api-keys/api-keys.module";
import { UploadModule } from "./modules/upload/upload.module";
import { validateEnv } from "src/common/utils/validate-env";
import { LoggerModule } from "./common/utils/logger";

const isDevelopment = process.env.NODE_ENV !== "production";

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      ...(isDevelopment
        ? {
            envFilePath: [`.env.local`],
          }
        : {}),
      // envFilePath: [`.env.${process.env.NODE_ENV || "development"}`],
      validate: validateEnv,
    }),

    // Database connection
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGODB_URI ||
          "mongodb://localhost:27017/imaginary-storage",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    // Feature modules
    LoggerModule,
    AuthModule,
    UsersModule,
    FilesModule,
    StorageModule,
    OnboardingModule,
    ShellModule,
    ApiKeysModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
