import { UploadResult } from "@/common/interfaces/storage.interface";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from "fs";
import { FilterQuery, Model, Types } from "mongoose";
import * as path from "path";
import { ERROR_CODES } from "../../common/constants/error-code.constansts";
import { AppException } from "../../common/dto/app-exception";
import { File, FileDocument } from "../../schemas/file.schema";
import { StorageService } from "../storage/storage.service";
import { GetFilesDto } from "./dto/get-files.dto";
import { UploadFileDto } from "./dto/upload-file.dto";
import { CreateFolderDto } from "./dto/create-folder.dto";

@Injectable()
export class FilesService {
  logger: Logger = new Logger(FilesService.name);
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private storageService: StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    uploadFileDto: UploadFileDto,
  ): Promise<UploadResult & { provider: string }> {
    // ): Promise<FileDocument> {
    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.NO_FILE_UPLOADED,
        message: "Files.uploadFile.noFile",
        userMessage: "No file uploaded",
        details: "Please select a file to upload.",
      });
    }

    const tempFilePath = file.path;
    const originalName = file.originalname;
    const fileSize = file.size;
    const mimeType = file.mimetype;
    const fileExtension = path.extname(originalName).toLowerCase();

    this.logger.debug(
      JSON.stringify({
        tempFilePath,
        originalName,
        fileSize,
        mimeType,
        fileExtension,
        fileExists: fs.existsSync(tempFilePath),
        ...uploadFileDto,
      }),
    );

    // validate files locaiton:
    if (!fs.existsSync(tempFilePath)) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: "Files.uploadFile.fileNotFound",
        userMessage: "File not found",
        details: "The uploaded file could not be found on the server.",
      });
    }

    try {
      // Generate unique filename for cloud storage
      const uniqueFileName = this.generateUniqueFileName(userId, originalName);
      this.logger.debug(`uniqueFileName => ${JSON.stringify(uniqueFileName)}`);

      // Upload to cloud storage
      const uploadResult = await this.storageService.uploadFile(userId, {
        tmpLocation: tempFilePath,
        mimeType,
        fullPath: `${uploadFileDto.folderPath ?? ""}${uniqueFileName}`,
      });

      this.logger.debug(`uploadResult => ${JSON.stringify(uploadResult)}`);

      // Ensure folder path exists
      const folderPath = await this.ensureFolderPath(
        userId,
        uploadFileDto.folderPath,
      );
      this.logger.debug(`folderPath => ${JSON.stringify(folderPath)}`);
      const parentPath = this.extractParentPath(uploadResult.fullPath);
      this.logger.debug(`parentPath => ${JSON.stringify(parentPath)}`);

      // Save file metadata to database
      const fileDoc = new this.fileModel({
        ownerId: new Types.ObjectId(userId),
        type: "file",
        originalName: originalName,
        fileName: uniqueFileName,
        fullPath: `_rt/${uploadResult.fullPath}`,
        parentPath,
        mimeType,
        fileExtension,
        storageProvider: uploadResult.provider,
        fileUrl: uploadResult.fileUrl,
        metadata: {
          uploadedAt: new Date(),
          provider: uploadResult.provider,
        },
      });

      await fileDoc.save();
      this.logger.debug(
        `fileDoc.toObject() => ${JSON.stringify(fileDoc.toObject())}`,
      );

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return fileDoc.toObject();
    } catch (error) {
      // Clean up temporary file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  async getFiles(
    userId: string,
    getFilesDto: GetFilesDto,
  ): Promise<{
    items: { type: "file" | "folder"; name: string; fullPath: string }[];
  }> {
    const {
      search,
      mimeType,
      sortBy = "createdAt",
      sortOrder = "desc",
      prefix,
    } = getFilesDto;

    this.logger.debug(`getFilesDto => ${JSON.stringify(getFilesDto)}`);

    // Build query
    const query: FilterQuery<FileDocument> = {
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
      parentPath: prefix ? `_rt/${prefix}` : "_rt/",
    };
    
    // ✅ Text search on file/folder names
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: "i" } },
        { "metadata.tags": { $regex: search, $options: "i" } },
      ];
    }
    
    // ✅ Filter by mimeType (only affects files)
    if (mimeType) {
      query.mimeType = mimeType;
    }

    this.logger.debug(`query => ${JSON.stringify(query)}`);
    
    // === Build Sort Object ===
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // === Fetch Files/Folders ===
    const files = await this.fileModel
      .find(query)
      .sort(sort)
      .select(
        "type originalName fullPath fileSize mimeType fileUrl providerMetadata createdAt",
      )
      .lean();
    this.logger.debug(`files.length => ${JSON.stringify(files.length)}`);

    return {
      items: files.map((f) => ({
        type: f.type,
        name: f.originalName,
        fullPath: f.fullPath?.slice?.(4), // remove "_rt/" prefix
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        providerMetadata: f.providerMetadata,
        previewUrl: f.mimeType?.startsWith?.("image") ? f.fileUrl : null,
      })),
    };
  }

  async getFileById(fileId: string, userId: string): Promise<FileDocument> {
    const file = await this.fileModel.findOne({
      _id: fileId,
      ownerId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: "Files.getFileById.fileNotFound",
        userMessage: "File not found",
      });
    }

    return file;
  }

  async createFolder(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<{ fullPath: string }> {
    try {
      const { fullPath } = createFolderDto;
      return { fullPath: await this.ensureFolderPath(userId, fullPath) };
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: "Files.createFolder.failed",
        userMessage: "Failed to create folder",
        details: error.message,
      });
    }
  }

  /**
   * Ensures all folders in a path exist for the given user.
   * Creates missing folders in the database.
   */
  private async ensureFolderPath(userId: string, folderPath: string) {
    if (!folderPath) return "_rt/"; // root-level

    const segments = folderPath.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      const fullPath = currentPath + segment + "/";
      const parentPath = currentPath; // parent of this folder

      // Check if folder exists
      const existing = await this.fileModel.findOne({
        ownerId: userId,
        type: "folder",
        fullPath: `_rt/${fullPath}`,
        deletedAt: null,
      });

      if (!existing) {
        await this.fileModel.create({
          ownerId: userId,
          type: "folder",
          originalName: segment,
          fileName: segment, // folder name can be same as originalName
          fullPath: `_rt/${fullPath}`,
          parentPath: `_rt/${parentPath}`,
          storageProvider: "aws", // or your default provider
          metadata: { createdAt: new Date() },
        });
        ``;
      }

      currentPath = fullPath;
    }

    return currentPath; // return last folder fullPath
  }

  // async getPublicFile(fileId: string): Promise<FileDocument> {
  //   const file = await this.fileModel.findOne({
  //     _id: fileId,
  //     isPublic: true,
  //     deletedAt: null,
  //   });

  //   if (!file) {
  //     throw new AppException({
  //       statusCode: HttpStatus.NOT_FOUND,
  //       code: ERROR_CODES.FILE_NOT_FOUND,
  //       message: "Files.getPublicFile.fileNotFound",
  //       userMessage: "Public file not found",
  //     });
  //   }

  //   return file;
  // }

  // async getSharedFile(shareToken: string): Promise<FileDocument> {
  //   const file = await this.fileModel.findOne({
  //     shareToken,
  //     deletedAt: null,
  //   });

  //   if (!file) {
  //     throw new AppException({
  //       statusCode: HttpStatus.NOT_FOUND,
  //       code: ERROR_CODES.FILE_NOT_FOUND,
  //       message: "Files.getSharedFile.fileNotFound",
  //       userMessage: "Shared file not found",
  //     });
  //   }

  //   if (!file.isShareTokenValid()) {
  //     throw new AppException({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       code: ERROR_CODES.SHARE_LINK_EXPIRED,
  //       message: "Files.getSharedFile.shareLinkExpired",
  //       userMessage: "Share link has expired",
  //     });
  //   }

  //   return file;
  // }

  // async getDownloadUrl(
  //   fileId: string,
  //   userId: string,
  // ): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
  //   const file = await this.getFileById(fileId, userId);

  //   try {
  //     const downloadUrl = await this.storageService.getDownloadUrl(userId, {
  //       fileName: file.fileName,
  //       expiresIn: 3600, // 1 hour
  //       userId,
  //     });

  //     return {
  //       downloadUrl,
  //       fileName: file.originalName,
  //       expiresIn: 3600,
  //     };
  //   } catch (error) {
  //     throw new AppException({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       code: ERROR_CODES.BAD_REQUEST,
  //       message: "Files.getDownloadUrl.failedToGenerateDownloadUrl",
  //       userMessage: "Failed to generate download URL",
  //     });
  //   }
  // }

  // async getPublicDownloadUrl(
  //   userId: string,
  //   fileId: string,
  // ): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
  //   const file = await this.getPublicFile(fileId);

  //   try {
  //     const downloadUrl = await this.storageService.getDownloadUrl(userId, {
  //       fileName: file.fileName,
  //       expiresIn: 3600, // 1 hour
  //       userId: file.ownerId.toString(),
  //     });

  //     return {
  //       downloadUrl,
  //       fileName: file.originalName,
  //       expiresIn: 3600,
  //     };
  //   } catch (error) {
  //     throw new AppException({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       code: ERROR_CODES.BAD_REQUEST,
  //       message: "Files.getPublicDownloadUrl.failedToGenerateDownloadUrl",
  //       userMessage: "Failed to generate download URL",
  //     });
  //   }
  // }

  // async getSharedDownloadUrl(
  //   userId: string,
  //   shareToken: string,
  // ): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
  //   const file = await this.getSharedFile(shareToken);

  //   try {
  //     const downloadUrl = await this.storageService.getDownloadUrl(userId, {
  //       fileName: file.fileName,
  //       expiresIn: 3600, // 1 hour
  //       userId: file.ownerId.toString(),
  //     });

  //     return {
  //       downloadUrl,
  //       fileName: file.originalName,
  //       expiresIn: 3600,
  //     };
  //   } catch (error) {
  //     throw new AppException({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       code: ERROR_CODES.BAD_REQUEST,
  //       message: "Files.getSharedDownloadUrl.failedToGenerateDownloadUrl",
  //       userMessage: "Failed to generate download URL",
  //     });
  //   }
  // }

  // async shareFile(
  //   fileId: string,
  //   userId: string,
  //   shareFileDto: ShareFileDto,
  // ): Promise<{ shareToken: string; shareUrl: string; expiresAt: Date }> {
  //   const file = await this.getFileById(fileId, userId);

  //   const shareToken = file.generateShareToken(shareFileDto.expiryHours);
  //   await file.save();

  //   const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/shared/${shareToken}`;

  //   return {
  //     shareToken,
  //     shareUrl,
  //     expiresAt: file.shareExpiry,
  //   };
  // }

  // async deleteFile(fileId: string, userId: string): Promise<void> {
  //   const file = await this.getFileById(fileId, userId);

  //   // Soft delete
  //   file.deletedAt = new Date();
  //   await file.save();

  //   // Optionally delete from cloud storage (uncomment for hard delete)
  //   // try {
  //   //   await this.storageService.deleteFile({
  //   //     fileName: file.fileName,
  //   //     userId,
  //   //   });
  //   // } catch (error) {
  //   //   console.error('Failed to delete file from cloud storage:', error);
  //   // }
  // }

  // async updateFileVisibility(
  //   fileId: string,
  //   userId: string,
  //   isPublic: boolean,
  // ): Promise<FileDocument> {
  //   const file = await this.getFileById(fileId, userId);

  //   file.isPublic = isPublic;

  //   // Clear share token if making private
  //   if (!isPublic) {
  //     file.shareToken = null;
  //     file.shareExpiry = null;
  //   }

  //   await file.save();
  //   return file;
  // }

  // utility funcitons:

  private generateUniqueFileName(userId: string, originalName: string): string {
    const fileExtension = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    return `${timestamp}-${randomSuffix}${fileExtension}`;
  }

  /**
   * Extracts the parent path from a fullPath.
   *
   * Examples:
   *  fullPath: "images/cat.jpg" => "_rt/images/"
   *  fullPath: "images/"       => "_rt/images/"
   *  fullPath: ""             => "_rt/"
   */
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
