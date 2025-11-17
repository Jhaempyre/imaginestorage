import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import * as fs from "fs";
import * as multer from "multer";
import * as path from "path";
import { File, FileSchema } from "../../schemas/file.schema";
import { StorageModule } from "../storage/storage.module";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PreviewService } from "./preview/preview.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    StorageModule,
    MulterModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
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
            const fileExtension = path.extname(file.originalname);
            cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
          },
        }),
        fileFilter: (req, file, cb) => {
          // const allowedTypes = configService.get('ALLOWED_FILE_TYPES')?.split(',') || [
          //   'image/jpeg',
          //   'image/png',
          //   'image/gif',
          //   'image/webp',
          //   'application/pdf',
          //   'text/plain',
          //   'video/mp4',
          //   'application/x-zip-compressed',
          // ];

          cb(null, true);
          // if (allowedTypes.includes(file.mimetype)) {
          // } else {
          //   cb(new Error(`File type ${file.mimetype} is not allowed`), false);
          // }
        },
        limits: {
          fileSize:
            parseInt(configService.get("MAX_FILE_SIZE") || "500") * 1024 * 1024, // Convert MB to bytes
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, PreviewService, JwtService],
  exports: [FilesService],
})
export class FilesModule {}
