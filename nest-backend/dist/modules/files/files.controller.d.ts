import { Request } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { GetFilesDto } from './dto/get-files.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto, request: Request): Promise<ApiResponseDto<{
        file: {
            id: any;
            originalName: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            storageProvider: string;
            isPublic: boolean;
            createdAt: Date;
        };
    }>>;
    getFiles(getFilesDto: GetFilesDto, request: Request): Promise<ApiResponseDto<{
        files: import("../../schemas/file.schema").FileDocument[];
        pagination: import("../../common/dto/pagination.dto").PaginationResponseDto;
    }>>;
    getFileById(fileId: string, request: Request): Promise<ApiResponseDto<{
        file: import("../../schemas/file.schema").FileDocument;
    }>>;
    getPublicFile(fileId: string): Promise<ApiResponseDto<{
        file: import("../../schemas/file.schema").FileDocument;
    }>>;
    getSharedFile(shareToken: string): Promise<ApiResponseDto<{
        file: import("../../schemas/file.schema").FileDocument;
    }>>;
    getDownloadUrl(fileId: string, request: Request): Promise<ApiResponseDto<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>>;
    getPublicDownloadUrl(fileId: string, request: Request): Promise<ApiResponseDto<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>>;
    getSharedDownloadUrl(request: Request, shareToken: string): Promise<ApiResponseDto<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>>;
    shareFile(fileId: string, shareFileDto: ShareFileDto, request: Request): Promise<ApiResponseDto<{
        shareToken: string;
        shareUrl: string;
        expiresAt: Date;
    }>>;
    updateFileVisibility(fileId: string, isPublic: boolean, request: Request): Promise<ApiResponseDto<{
        file: import("../../schemas/file.schema").FileDocument;
    }>>;
    deleteFile(fileId: string, request: Request): Promise<ApiResponseDto<any>>;
}
