import { Injectable, HttpStatus } from '@nestjs/common';
import { AppException } from '../../common/dto/app-exception';
import { ERROR_CODES } from '../../common/constants/error-code.constansts';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { File, FileDocument } from '../../schemas/file.schema';
import { StorageService } from '../storage/storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { GetFilesDto } from './dto/get-files.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private storageService: StorageService,
  ) { }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    uploadFileDto: UploadFileDto,
  ): Promise<FileDocument> {
    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.NO_FILE_UPLOADED,
        message: 'Files.uploadFile.noFile',
        userMessage: 'No file uploaded',
        details: 'Please select a file to upload.',
      });
    }

    const tempFilePath = file.path;
    const originalName = file.originalname;
    const fileSize = file.size;
    const mimeType = file.mimetype;
    const fileExtension = path.extname(originalName).toLowerCase();

    console.log({
      tempFilePath,
      originalName,
      fileSize,
      mimeType,
      fileExtension,
      fileExists: fs.existsSync(tempFilePath),
      ...uploadFileDto,
    })

    // validate files locaiton:
    if (!fs.existsSync(tempFilePath)) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: 'Files.uploadFile.fileNotFound',
        userMessage: 'File not found',
        details: 'The uploaded file could not be found on the server.',
      });
    }

    try {
      // Generate unique filename for cloud storage
      const uniqueFileName = this.generateUniqueFileName(userId, originalName);

      // Upload to cloud storage
      const uploadResult = await this.storageService.uploadFile(userId, {
        filePath: tempFilePath,
        fileName: uniqueFileName,
        userId: String(userId),
        mimeType,
        fileSize,
      });

      // Save file metadata to database
      const fileDoc = new this.fileModel({
        userId: new Types.ObjectId(userId),
        originalName,
        fileName: uploadResult.fileName,
        fileSize,
        mimeType,
        fileExtension,
        storageProvider: uploadResult.provider,
        storageLocation: uploadResult.storageLocation,
        isPublic: uploadFileDto.isPublic || false,
        metadata: {
          ...uploadFileDto?.metadata,
          uploadedAt: new Date(),
          provider: uploadResult.provider,
        },
      });

      await fileDoc.save();

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return fileDoc;
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
  ): Promise<{ files: FileDocument[]; pagination: PaginationResponseDto }> {
    const { page = 1, limit = 10, search, mimeType, sortBy = 'createdAt', sortOrder = 'desc' } = getFilesDto;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    };

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { 'metadata.description': { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (mimeType) {
      query.mimeType = mimeType;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [files, totalFiles] = await Promise.all([
      this.fileModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      this.fileModel.countDocuments(query),
    ]);

    const pagination: PaginationResponseDto = {
      currentPage: page,
      totalPages: Math.ceil(totalFiles / limit),
      totalItems: totalFiles,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalFiles / limit),
      hasPrevPage: page > 1,
    };

    return { files, pagination };
  }

  async getFileById(fileId: string, userId: string): Promise<FileDocument> {
    const file = await this.fileModel.findOne({
      _id: fileId,
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: 'Files.getFileById.fileNotFound',
        userMessage: 'File not found',
      });
    }

    return file;
  }

  async getPublicFile(fileId: string): Promise<FileDocument> {
    const file = await this.fileModel.findOne({
      _id: fileId,
      isPublic: true,
      deletedAt: null,
    });

    if (!file) {
      throw new AppException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: 'Files.getPublicFile.fileNotFound',
        userMessage: 'Public file not found',
      });
    }

    return file;
  }

  async getSharedFile(shareToken: string): Promise<FileDocument> {
    const file = await this.fileModel.findOne({
      shareToken,
      deletedAt: null,
    });

    if (!file) {
      throw new AppException({  
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.FILE_NOT_FOUND,
        message: 'Files.getSharedFile.fileNotFound',
        userMessage: 'Shared file not found',
      });
    }

    if (!file.isShareTokenValid()) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.SHARE_LINK_EXPIRED,
        message: 'Files.getSharedFile.shareLinkExpired',
        userMessage: 'Share link has expired',
      });
    }

    return file;
  }

  async getDownloadUrl(fileId: string, userId: string): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
    const file = await this.getFileById(fileId, userId);

    try {
      const downloadUrl = await this.storageService.getDownloadUrl(userId, {
        fileName: file.fileName,
        expiresIn: 3600, // 1 hour
        userId,
      });

      return {
        downloadUrl,
        fileName: file.originalName,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Files.getDownloadUrl.failedToGenerateDownloadUrl',
        userMessage: 'Failed to generate download URL',
      });
    }
  }

  async getPublicDownloadUrl(userId: string, fileId: string): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
    const file = await this.getPublicFile(fileId);

    try {
      const downloadUrl = await this.storageService.getDownloadUrl(userId, {
        fileName: file.fileName,
        expiresIn: 3600, // 1 hour
        userId: file.userId.toString(),
      });

      return {
        downloadUrl,
        fileName: file.originalName,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Files.getPublicDownloadUrl.failedToGenerateDownloadUrl',
        userMessage: 'Failed to generate download URL',
      });
    }
  }

  async getSharedDownloadUrl(userId: string, shareToken: string): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
    const file = await this.getSharedFile(shareToken);

    try {
      const downloadUrl = await this.storageService.getDownloadUrl(userId, {
        fileName: file.fileName,
        expiresIn: 3600, // 1 hour
        userId: file.userId.toString(),
      });

      return {
        downloadUrl,
        fileName: file.originalName,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Files.getSharedDownloadUrl.failedToGenerateDownloadUrl',
        userMessage: 'Failed to generate download URL',
      });
    }
  }

  async shareFile(fileId: string, userId: string, shareFileDto: ShareFileDto): Promise<{ shareToken: string; shareUrl: string; expiresAt: Date }> {
    const file = await this.getFileById(fileId, userId);

    const shareToken = file.generateShareToken(shareFileDto.expiryHours);
    await file.save();

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`;

    return {
      shareToken,
      shareUrl,
      expiresAt: file.shareExpiry,
    };
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFileById(fileId, userId);

    // Soft delete
    file.deletedAt = new Date();
    await file.save();

    // Optionally delete from cloud storage (uncomment for hard delete)
    // try {
    //   await this.storageService.deleteFile({
    //     fileName: file.fileName,
    //     userId,
    //   });
    // } catch (error) {
    //   console.error('Failed to delete file from cloud storage:', error);
    // }
  }

  async updateFileVisibility(fileId: string, userId: string, isPublic: boolean): Promise<FileDocument> {
    const file = await this.getFileById(fileId, userId);

    file.isPublic = isPublic;

    // Clear share token if making private
    if (!isPublic) {
      file.shareToken = null;
      file.shareExpiry = null;
    }

    await file.save();
    return file;
  }

  private generateUniqueFileName(userId: string, originalName: string): string {
    const fileExtension = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    return `${timestamp}-${randomSuffix}${fileExtension}`;
  }
}