import { Request } from 'express';
import { StorageService } from './storage.service';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    private ensureTempDirectoryExists;
    getStorageStatus(request: Request): Promise<ApiResponseDto<{
        stats: {
            provider: string;
            isValidated: boolean;
            lastValidatedAt: Date;
            validationError: any;
            isActive: boolean;
            createdAt: Date;
        };
        healthCheck: {
            provider: string;
            healthy: boolean;
        };
    }>>;
    uploadFile(request: Request, file: Express.Multer.File): Promise<ApiResponseDto<{
        originalName: string;
        size: number;
        mimetype: string;
        storageLocation: string;
        publicUrl: string;
        provider: string;
        uploadedAt: string;
    }>>;
    uploadMultipleFiles(request: Request, files: Express.Multer.File[]): Promise<ApiResponseDto<{
        uploadedFiles: any[];
        totalFiles: number;
        uploadedAt: string;
    }>>;
    getDownloadUrl(request: Request, fileName: string): Promise<ApiResponseDto<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>>;
    deleteFile(request: Request, fileName: string): Promise<ApiResponseDto<{
        fileName: string;
        deletedAt: string;
    }>>;
}
