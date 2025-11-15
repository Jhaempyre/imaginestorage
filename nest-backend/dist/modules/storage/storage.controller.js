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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const storage_service_1 = require("./storage.service");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './../public/temp',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
            cb(null, filename);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('File type not allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
        this.ensureTempDirectoryExists();
    }
    ensureTempDirectoryExists() {
        const tempDir = './public/temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    }
    async getStorageStatus(request) {
        const userId = request.user['_id'];
        const stats = await this.storageService.getUserStorageConfig(userId);
        const healthCheck = await this.storageService.healthCheck(userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Storage.getStorageStatus.success',
            data: {
                stats,
                healthCheck,
            },
        });
    }
    async uploadFile(request, file) {
        if (!file) {
            throw new common_1.HttpException('No file uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        const userId = request.user['_id'];
        let tempFilePath = null;
        try {
            tempFilePath = file.path;
            console.log('File received:', {
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                tempPath: tempFilePath
            });
            const uploadParams = {
                filePath: tempFilePath,
                fileName: file.originalname,
                userId: userId,
                mimeType: file.mimetype,
                fileSize: file.size
            };
            const uploadResult = await this.storageService.uploadFile(userId, uploadParams);
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                tempFilePath = null;
            }
            return api_response_dto_1.ApiResponseDto.success({
                message: 'File uploaded successfully',
                data: {
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    storageLocation: uploadResult.storageLocation,
                    publicUrl: uploadResult.publicUrl,
                    provider: uploadResult.provider,
                    uploadedAt: new Date().toISOString()
                },
            });
        }
        catch (error) {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath);
                }
                catch (cleanupError) {
                    console.error('Failed to cleanup temporary file:', cleanupError);
                }
            }
            console.error('Upload error:', error);
            throw new common_1.HttpException(`Upload failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadMultipleFiles(request, files) {
        if (!files || files.length === 0) {
            throw new common_1.HttpException('No files uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        const userId = request.user['_id'];
        const uploadResults = [];
        const tempFilePaths = [];
        try {
            for (const file of files) {
                tempFilePaths.push(file.path);
                const uploadParams = {
                    filePath: file.path,
                    fileName: file.originalname,
                    userId: userId,
                    mimeType: file.mimetype,
                    fileSize: file.size
                };
                const uploadResult = await this.storageService.uploadFile(userId, uploadParams);
                uploadResults.push({
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    storageLocation: uploadResult.storageLocation,
                    publicUrl: uploadResult.publicUrl,
                    provider: uploadResult.provider
                });
            }
            tempFilePaths.forEach(tempPath => {
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            });
            return api_response_dto_1.ApiResponseDto.success({
                message: `${uploadResults.length} files uploaded successfully`,
                data: {
                    uploadedFiles: uploadResults,
                    totalFiles: uploadResults.length,
                    uploadedAt: new Date().toISOString()
                },
            });
        }
        catch (error) {
            tempFilePaths.forEach(tempPath => {
                if (fs.existsSync(tempPath)) {
                    try {
                        fs.unlinkSync(tempPath);
                    }
                    catch (cleanupError) {
                        console.error('Failed to cleanup temporary file:', cleanupError);
                    }
                }
            });
            throw new common_1.HttpException(`Upload failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDownloadUrl(request, fileName) {
        const userId = request.user['_id'];
        try {
            const downloadUrl = await this.storageService.getDownloadUrl(userId, {
                fileName,
                userId,
                expiresIn: 3600
            });
            return api_response_dto_1.ApiResponseDto.success({
                message: 'Download URL generated successfully',
                data: {
                    downloadUrl,
                    fileName,
                    expiresIn: 3600
                },
            });
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to generate download URL: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteFile(request, fileName) {
        const userId = request.user['_id'];
        try {
            await this.storageService.deleteFile(userId, {
                fileName,
                userId
            });
            return api_response_dto_1.ApiResponseDto.success({
                message: 'File deleted successfully',
                data: {
                    fileName,
                    deletedAt: new Date().toISOString()
                },
            });
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete file: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get storage provider status and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Storage status retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorageStatus", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file to configured storage provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid file or configuration' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multerConfig)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple files to configured storage provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files uploaded successfully' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('files', multerConfig)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('download/:fileName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get download URL for a file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Download URL generated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('fileName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Delete)(':fileName'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a file from storage' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File deleted successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('fileName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteFile", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('Storage'),
    (0, common_1.Controller)('storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map