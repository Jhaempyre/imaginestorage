import { Model } from 'mongoose';
import { FileDocument } from '../../schemas/file.schema';
import { StorageService } from '../storage/storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { GetFilesDto } from './dto/get-files.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
export declare class FilesService {
    private fileModel;
    private storageService;
    constructor(fileModel: Model<FileDocument>, storageService: StorageService);
    uploadFile(file: Express.Multer.File, userId: string, uploadFileDto: UploadFileDto): Promise<FileDocument>;
    getFiles(userId: string, getFilesDto: GetFilesDto): Promise<{
        files: FileDocument[];
        pagination: PaginationResponseDto;
    }>;
    getFileById(fileId: string, userId: string): Promise<FileDocument>;
    getPublicFile(fileId: string): Promise<FileDocument>;
    getSharedFile(shareToken: string): Promise<FileDocument>;
    getDownloadUrl(fileId: string, userId: string): Promise<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>;
    getPublicDownloadUrl(userId: string, fileId: string): Promise<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>;
    getSharedDownloadUrl(userId: string, shareToken: string): Promise<{
        downloadUrl: string;
        fileName: string;
        expiresIn: number;
    }>;
    shareFile(fileId: string, userId: string, shareFileDto: ShareFileDto): Promise<{
        shareToken: string;
        shareUrl: string;
        expiresAt: Date;
    }>;
    deleteFile(fileId: string, userId: string): Promise<void>;
    updateFileVisibility(fileId: string, userId: string, isPublic: boolean): Promise<FileDocument>;
    private generateUniqueFileName;
}
