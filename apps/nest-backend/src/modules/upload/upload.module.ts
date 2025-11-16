import {
  Module
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import * as fs from "fs";
import * as multer from "multer";
import * as path from "path";
import { ApiKey, ApiKeySchema } from "../../schemas/api-key.schema";
import { File, FileSchema } from "../../schemas/file.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import { ApiKeysModule } from "../api-keys/api-keys.module";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [
    StorageModule,
    ApiKeysModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: User.name, schema: UserSchema },
      { name: File.name, schema: FileSchema },
    ]),
    MulterModule.register({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), "uploads", "temp");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              "-" +
              uniqueSuffix +
              path.extname(file.originalname),
          );
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule  {}
