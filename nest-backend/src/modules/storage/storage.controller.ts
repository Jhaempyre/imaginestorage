import { 
  Controller, 
  Get, 
  Post, 
  Req, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  HttpException,
  HttpStatus, 
  Delete,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

// Multer configuration for temporary file storage
const multerConfig = {
  storage: diskStorage({
    destination: './../public/temp',
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Add file type restrictions if needed
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageController {
  constructor(private readonly storageService: StorageService) {
    // Ensure temp directory exists
    this.ensureTempDirectoryExists();
  }

  private ensureTempDirectoryExists() {
    const tempDir = './public/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get storage provider status and statistics' })
  @ApiResponse({ status: 200, description: 'Storage status retrieved successfully' })
  async getStorageStatus(@Req() request: Request) {
    const userId = request.user['_id'];
    const stats = await this.storageService.getUserStorageConfig(userId);
    const healthCheck = await this.storageService.healthCheck(userId);

    return ApiResponseDto.success({
      message: 'Storage.getStorageStatus.success',
      data: {
        stats,
        healthCheck,
      },
    });
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file to configured storage provider' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or configuration' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const userId = request.user['_id'];
    let tempFilePath: string | null = null;

    try {
      // Get the temporary file path
      tempFilePath = file.path;
      
      console.log('File received:', {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        tempPath: tempFilePath
      });

      // Prepare upload parameters
      const uploadParams = {
        filePath: tempFilePath,
        fileName: file.originalname,
        userId: userId,
        mimeType: file.mimetype,
        fileSize: file.size
      };

      // Upload to configured storage provider (GCP in this case)
      const uploadResult = await this.storageService.uploadFile(userId, uploadParams);

      // Clean up temporary file after successful upload
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        tempFilePath = null; // Mark as cleaned up
      }

      return ApiResponseDto.success({
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

    } catch (error) {
      // Clean up temporary file in case of error
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error('Failed to cleanup temporary file:', cleanupError);
        }
      }

      console.error('Upload error:', error);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files to configured storage provider' })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('files', multerConfig)) // Note: For multiple files, you'd use FilesInterceptor
  async uploadMultipleFiles(
    @Req() request: Request,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
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

      // Clean up all temporary files after successful uploads
      tempFilePaths.forEach(tempPath => {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      });

      return ApiResponseDto.success({
        message: `${uploadResults.length} files uploaded successfully`,
        data: {
          uploadedFiles: uploadResults,
          totalFiles: uploadResults.length,
          uploadedAt: new Date().toISOString()
        },
      });

    } catch (error) {
      // Clean up temporary files in case of error
      tempFilePaths.forEach(tempPath => {
        if (fs.existsSync(tempPath)) {
          try {
            fs.unlinkSync(tempPath);
          } catch (cleanupError) {
            console.error('Failed to cleanup temporary file:', cleanupError);
          }
        }
      });

      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('download/:fileName')
  @ApiOperation({ summary: 'Get download URL for a file' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  async getDownloadUrl(
    @Req() request: Request,
    @Param('fileName') fileName: string,
  ) {
    const userId = request.user['_id'];

    try {
      const downloadUrl = await this.storageService.getDownloadUrl(userId, {
        fileName,
        userId,
        expiresIn: 3600 // 1 hour
      });

      return ApiResponseDto.success({
        message: 'Download URL generated successfully',
        data: {
          downloadUrl,
          fileName,
          expiresIn: 3600
        },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to generate download URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':fileName')
  @ApiOperation({ summary: 'Delete a file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(
    @Req() request: Request,
    @Param('fileName') fileName: string,
  ) {
    const userId = request.user['_id'];

    try {
      await this.storageService.deleteFile(userId, {
        fileName,
        userId
      });

      return ApiResponseDto.success({
        message: 'File deleted successfully',
        data: {
          fileName,
          deletedAt: new Date().toISOString()
        },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to delete file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}