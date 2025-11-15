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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const share_file_dto_1 = require("./dto/share-file.dto");
const get_files_dto_1 = require("./dto/get-files.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file, uploadFileDto, request) {
        const userId = request.user['_id'];
        const uploadedFile = await this.filesService.uploadFile(file, userId, uploadFileDto);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.uploadFile.success',
            data: {
                file: {
                    id: uploadedFile._id,
                    originalName: uploadedFile.originalName,
                    fileName: uploadedFile.fileName,
                    fileSize: uploadedFile.fileSize,
                    mimeType: uploadedFile.mimeType,
                    storageProvider: uploadedFile.storageProvider,
                    isPublic: uploadedFile.isPublic,
                    createdAt: uploadedFile.createdAt,
                },
            },
        });
    }
    async getFiles(getFilesDto, request) {
        const userId = request.user['_id'];
        const result = await this.filesService.getFiles(userId, getFilesDto);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getFiles.success',
            data: {
                files: result.files,
                pagination: result.pagination,
            },
        });
    }
    async getFileById(fileId, request) {
        const userId = request.user['_id'];
        const file = await this.filesService.getFileById(fileId, userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getFileById.success',
            data: { file },
        });
    }
    async getPublicFile(fileId) {
        const file = await this.filesService.getPublicFile(fileId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getPublicFile.success',
            data: { file },
        });
    }
    async getSharedFile(shareToken) {
        const file = await this.filesService.getSharedFile(shareToken);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getSharedFile.success',
            data: { file },
        });
    }
    async getDownloadUrl(fileId, request) {
        const userId = request.user['_id'];
        const result = await this.filesService.getDownloadUrl(fileId, userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getDownloadUrl.success',
            data: result,
        });
    }
    async getPublicDownloadUrl(fileId, request) {
        const userId = request.user['_id'];
        const result = await this.filesService.getPublicDownloadUrl(userId, fileId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getPublicDownloadUrl.success',
            data: result,
        });
    }
    async getSharedDownloadUrl(request, shareToken) {
        const userId = request.user['_id'];
        const result = await this.filesService.getSharedDownloadUrl(userId, shareToken);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.getSharedDownloadUrl.success',
            data: result,
        });
    }
    async shareFile(fileId, shareFileDto, request) {
        const userId = request.user['_id'];
        const result = await this.filesService.shareFile(fileId, userId, shareFileDto);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.shareFile.success',
            data: result,
        });
    }
    async updateFileVisibility(fileId, isPublic, request) {
        const userId = request.user['_id'];
        const file = await this.filesService.updateFileVisibility(fileId, userId, isPublic);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.updateFileVisibility.success',
            data: { file },
        });
    }
    async deleteFile(fileId, request) {
        const userId = request.user['_id'];
        await this.filesService.deleteFile(fileId, userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Files.deleteFile.success',
            data: null,
        });
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file to cloud storage' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload',
                },
                isPublic: {
                    type: 'boolean',
                    description: 'Whether the file should be public',
                    default: false,
                },
                metadata: {
                    type: 'object',
                    description: 'Additional metadata for the file',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or upload failed' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.UploadFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user files with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_files_dto_1.GetFilesDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public file details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public file details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Public file not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getPublicFile", null);
__decorate([
    (0, common_1.Get)('shared/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shared file details by token' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Share token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shared file details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shared file not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Share link has expired' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getSharedFile", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file download URL' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Download URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Get)('public/:id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public file download URL' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public download URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Public file not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getPublicDownloadUrl", null);
__decorate([
    (0, common_1.Get)('shared/:token/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shared file download URL' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Share token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shared download URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shared file not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Share link has expired' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getSharedDownloadUrl", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate share link for file' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Share link generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_file_dto_1.ShareFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "shareFile", null);
__decorate([
    (0, common_1.Patch)(':id/visibility'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update file visibility (public/private)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                isPublic: {
                    type: 'boolean',
                    description: 'Whether the file should be public',
                },
            },
            required: ['isPublic'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File visibility updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isPublic')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "updateFileVisibility", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete file (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map