"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../common/dto/app-exception");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fs = require("fs");
const path = require("path");
const file_schema_1 = require("../../schemas/file.schema");
const storage_service_1 = require("../storage/storage.service");
let FilesService = class FilesService {
    constructor(fileModel, storageService) {
        this.fileModel = fileModel;
        this.storageService = storageService;
    }
    async uploadFile(file, userId, uploadFileDto) {
        if (!file) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.NO_FILE_UPLOADED,
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
        });
        if (!fs.existsSync(tempFilePath)) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.FILE_NOT_FOUND,
                message: 'Files.uploadFile.fileNotFound',
                userMessage: 'File not found',
                details: 'The uploaded file could not be found on the server.',
            });
        }
        try {
            const uniqueFileName = this.generateUniqueFileName(userId, originalName);
            const uploadResult = await this.storageService.uploadFile(userId, {
                filePath: tempFilePath,
                fileName: uniqueFileName,
                userId: String(userId),
                mimeType,
                fileSize,
            });
            const fileDoc = new this.fileModel({
                userId: new mongoose_2.Types.ObjectId(userId),
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
            fs.unlinkSync(tempFilePath);
            return fileDoc;
        }
        catch (error) {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            throw error;
        }
    }
    async getFiles(userId, getFilesDto) {
        const { page = 1, limit = 10, search, mimeType, sortBy = 'createdAt', sortOrder = 'desc' } = getFilesDto;
        const skip = (page - 1) * limit;
        const query = {
            userId: new mongoose_2.Types.ObjectId(userId),
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
        const sort = {};
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
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalFiles / limit),
            totalItems: totalFiles,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(totalFiles / limit),
            hasPrevPage: page > 1,
        };
        return { files, pagination };
    }
    async getFileById(fileId, userId) {
        const file = await this.fileModel.findOne({
            _id: fileId,
            userId: new mongoose_2.Types.ObjectId(userId),
            deletedAt: null,
        });
        if (!file) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.FILE_NOT_FOUND,
                message: 'Files.getFileById.fileNotFound',
                userMessage: 'File not found',
            });
        }
        return file;
    }
    async getPublicFile(fileId) {
        const file = await this.fileModel.findOne({
            _id: fileId,
            isPublic: true,
            deletedAt: null,
        });
        if (!file) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.FILE_NOT_FOUND,
                message: 'Files.getPublicFile.fileNotFound',
                userMessage: 'Public file not found',
            });
        }
        return file;
    }
    async getSharedFile(shareToken) {
        const file = await this.fileModel.findOne({
            shareToken,
            deletedAt: null,
        });
        if (!file) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.FILE_NOT_FOUND,
                message: 'Files.getSharedFile.fileNotFound',
                userMessage: 'Shared file not found',
            });
        }
        if (!file.isShareTokenValid()) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.SHARE_LINK_EXPIRED,
                message: 'Files.getSharedFile.shareLinkExpired',
                userMessage: 'Share link has expired',
            });
        }
        return file;
    }
    async getDownloadUrl(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        try {
            const downloadUrl = await this.storageService.getDownloadUrl(userId, {
                fileName: file.fileName,
                expiresIn: 3600,
                userId,
            });
            return {
                downloadUrl,
                fileName: file.originalName,
                expiresIn: 3600,
            };
        }
        catch (error) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                message: 'Files.getDownloadUrl.failedToGenerateDownloadUrl',
                userMessage: 'Failed to generate download URL',
            });
        }
    }
    async getPublicDownloadUrl(userId, fileId) {
        const file = await this.getPublicFile(fileId);
        try {
            const downloadUrl = await this.storageService.getDownloadUrl(userId, {
                fileName: file.fileName,
                expiresIn: 3600,
                userId: file.userId.toString(),
            });
            return {
                downloadUrl,
                fileName: file.originalName,
                expiresIn: 3600,
            };
        }
        catch (error) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                message: 'Files.getPublicDownloadUrl.failedToGenerateDownloadUrl',
                userMessage: 'Failed to generate download URL',
            });
        }
    }
    async getSharedDownloadUrl(userId, shareToken) {
        const file = await this.getSharedFile(shareToken);
        try {
            const downloadUrl = await this.storageService.getDownloadUrl(userId, {
                fileName: file.fileName,
                expiresIn: 3600,
                userId: file.userId.toString(),
            });
            return {
                downloadUrl,
                fileName: file.originalName,
                expiresIn: 3600,
            };
        }
        catch (error) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                message: 'Files.getSharedDownloadUrl.failedToGenerateDownloadUrl',
                userMessage: 'Failed to generate download URL',
            });
        }
    }
    async shareFile(fileId, userId, shareFileDto) {
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
    async deleteFile(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        file.deletedAt = new Date();
        await file.save();
    }
    async updateFileVisibility(fileId, userId, isPublic) {
        const file = await this.getFileById(fileId, userId);
        file.isPublic = isPublic;
        if (!isPublic) {
            file.shareToken = null;
            file.shareExpiry = null;
        }
        await file.save();
        return file;
    }
    generateUniqueFileName(userId, originalName) {
        const fileExtension = path.extname(originalName).toLowerCase();
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        return `${timestamp}-${randomSuffix}${fileExtension}`;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(file_schema_1.File.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        storage_service_1.StorageService])
], FilesService);
//# sourceMappingURL=files.service.js.map