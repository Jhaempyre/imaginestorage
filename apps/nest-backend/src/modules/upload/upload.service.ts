import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import { ApiKey } from "../../schemas/api-key.schema";
import { User } from "../../schemas/user.schema";
import { File } from "../../schemas/file.schema";
import { StorageService } from "../storage/storage.service";
import { UploadTokenResponseDto } from "./dto/upload-token-response.dto";
import { UploadResponseDto } from "./dto/upload-response.dto";
import { dbFullPathOf } from "../files/utils/key-transfomers";
import { GetFilesResponseDto } from "../files/dto/get-files-response.dto";

interface TokenPayload {
  apiKeyId: string;
  userId: string;
  origin: string;
  iat: number;
  exp: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly TOKEN_EXPIRY = "1h"; // Token expires in 1 hour

  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(File.name) private fileModel: Model<File>,
    private readonly storageService: StorageService,
  ) {}

  async generateUploadToken(
    publicKey: string,
    origin: string,
  ): Promise<UploadTokenResponseDto> {
    try {
      // Find the API key by key field (which acts as the public key)
      const apiKey = await this.apiKeyModel
        .findOne({
          key: publicKey,
          isActive: true,
        })
        .populate("userId");

      if (!apiKey) {
        throw new UnauthorizedException("Invalid API key");
      }

      // Check if API key is revoked
      if (apiKey.revokedAt) {
        throw new UnauthorizedException("API key has been revoked");
      }

      // Verify user exists and is active
      const user = await this.userModel.findById(apiKey.userId);
      if (!user || !user.isEmailVerified) {
        throw new UnauthorizedException("User not found or email not verified");
      }

      // Generate JWT token with API key and user info
      const payload = {
        apiKeyId: apiKey._id.toString(),
        userId: user._id.toString(),
        origin,
      };

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.TOKEN_EXPIRY,
      });

      this.logger.log(
        `Generated upload token for user ${user._id} with API key ${apiKey._id}`,
      );

      return {
        token,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate upload token for public key ${publicKey}:`,
        error,
      );
      throw error;
    }
  }

  async uploadFileWithToken(
    file: Express.Multer.File,
    token: string,
    folderPath?: string,
  ): Promise<UploadResponseDto> {
    try {
      // Verify and decode token
      let payload: TokenPayload;
      try {
        payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      } catch (error) {
        throw new UnauthorizedException("Invalid or expired upload token");
      }

      // Verify API key is still valid
      const apiKey = await this.apiKeyModel.findById(payload.apiKeyId);
      if (!apiKey || !apiKey.isActive) {
        throw new UnauthorizedException("API key is no longer valid");
      }

      // Verify user still exists
      const user = await this.userModel.findById(payload.userId);
      if (!user || !user.isEmailVerified) {
        throw new UnauthorizedException("User not found or email not verified");
      }

      // Validate file size (100MB limit)

      //TODO: Get this maxsize cintraint from db ....
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new BadRequestException("File size exceeds 100MB limit");
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${path.parse(file.originalname).name}-${uniqueSuffix}${fileExtension}`;

      // Check if file exists
      if (!fs.existsSync(file.path)) {
        throw new BadRequestException("Uploaded file not found");
      }

      // Upload to storage
      const uploadResult = await this.storageService.uploadFile(
        payload.userId,
        {
          tmpLocation: file.path,
          fullPath: `${folderPath || ""}${uniqueFileName}`,
          mimeType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedVia: "widget",
            apiKeyId: payload.apiKeyId,
          },
        },
      );

      // Extract parent path for file organization
      const parentPath = this.extractParentPath(uploadResult.fullPath);

      // Save file record to database
      const fileRecord = new this.fileModel({
        ownerId: new Types.ObjectId(payload.userId),
        type: "file",
        originalName: file.originalname,
        fileName: uniqueFileName,
        mimeType: file.mimetype,
        size: file.size,
        folderPath: folderPath || "",
        parentPath: parentPath,
        fullPath: dbFullPathOf(uploadResult.fullPath),
        storageProvider: uploadResult.provider,
        fileUrl: uploadResult.fileUrl,
        metadata: {
          uploadedAt: new Date(),
          provider: uploadResult.provider,
          uploadedVia: "widget",
          apiKeyId: payload.apiKeyId,
        },
      });

      await fileRecord.save();

      // Clean up temporary file
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to cleanup temporary file ${file.path}:`,
          cleanupError,
        );
      }

      this.logger.log(
        `File uploaded successfully via widget: ${uniqueFileName} for user ${payload.userId}`,
      );

      return new UploadResponseDto(fileRecord.toObject());
    } catch (error) {
      // Clean up temporary file on error
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to cleanup temporary file on error:`,
          cleanupError,
        );
      }

      this.logger.error(`Failed to upload file with token:`, error);
      throw error;
    }
  }

  private extractParentPath(fullPath: string): string {
    if (!fullPath) return "_rt/";

    const normalized = fullPath.replace(/\\/g, "/"); // normalize slashes
    const parts = normalized.split("/").filter(Boolean);

    if (parts.length <= 1) {
      return "_rt/"; // means it's at root
    }

    // Remove last segment (file or folder name)
    parts.pop();

    return parts.length > 0 ? "_rt/" + parts.join("/") + "/" : "_rt/";
  }
}
