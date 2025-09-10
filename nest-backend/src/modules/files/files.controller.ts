import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { Request } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { GetFilesDto } from './dto/get-files.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload file to cloud storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const uploadedFile = await this.filesService.uploadFile(file, userId, uploadFileDto);

    return {
      success: true,
      message: 'File uploaded successfully',
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
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user files with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getFiles(
    @Query() getFilesDto: GetFilesDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.filesService.getFiles(userId, getFilesDto);

    return {
      success: true,
      message: 'Files retrieved successfully',
      data: {
        files: result.files,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get file details by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileById(
    @Param('id') fileId: string,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const file = await this.filesService.getFileById(fileId, userId);

    return {
      success: true,
      message: 'File details retrieved successfully',
      data: { file },
    };
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public file details' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Public file details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Public file not found' })
  async getPublicFile(@Param('id') fileId: string) {
    const file = await this.filesService.getPublicFile(fileId);

    return {
      success: true,
      message: 'Public file details retrieved successfully',
      data: { file },
    };
  }

  @Get('shared/:token')
  @ApiOperation({ summary: 'Get shared file details by token' })
  @ApiParam({ name: 'token', description: 'Share token' })
  @ApiResponse({ status: 200, description: 'Shared file details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shared file not found' })
  @ApiResponse({ status: 400, description: 'Share link has expired' })
  async getSharedFile(@Param('token') shareToken: string) {
    const file = await this.filesService.getSharedFile(shareToken);

    return {
      success: true,
      message: 'Shared file details retrieved successfully',
      data: { file },
    };
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get file download URL' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getDownloadUrl(
    @Param('id') fileId: string,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.filesService.getDownloadUrl(fileId, userId);

    return {
      success: true,
      message: 'Download URL generated successfully',
      data: result,
    };
  }

  @Get('public/:id/download')
  @ApiOperation({ summary: 'Get public file download URL' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Public download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Public file not found' })
  async getPublicDownloadUrl(
    @Param('id') fileId: string,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.filesService.getPublicDownloadUrl(userId, fileId);

    return {
      success: true,
      message: 'Public download URL generated successfully',
      data: result,
    };
  }

  @Get('shared/:token/download')
  @ApiOperation({ summary: 'Get shared file download URL' })
  @ApiParam({ name: 'token', description: 'Share token' })
  @ApiResponse({ status: 200, description: 'Shared download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Shared file not found' })
  @ApiResponse({ status: 400, description: 'Share link has expired' })
  async getSharedDownloadUrl(
    @Req() request: Request,
    @Param('token') shareToken: string) {
    const userId = request.user['_id'];
    const result = await this.filesService.getSharedDownloadUrl(userId, shareToken);

    return {
      success: true,
      message: 'Shared download URL generated successfully',
      data: result,
    };
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate share link for file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Share link generated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async shareFile(
    @Param('id') fileId: string,
    @Body() shareFileDto: ShareFileDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.filesService.shareFile(fileId, userId, shareFileDto);

    return {
      success: true,
      message: 'Share link generated successfully',
      data: result,
    };
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update file visibility (public/private)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiBody({
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
  })
  @ApiResponse({ status: 200, description: 'File visibility updated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async updateFileVisibility(
    @Param('id') fileId: string,
    @Body('isPublic') isPublic: boolean,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const file = await this.filesService.updateFileVisibility(fileId, userId, isPublic);

    return {
      success: true,
      message: 'File visibility updated successfully',
      data: { file },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete file (soft delete)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id') fileId: string,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    await this.filesService.deleteFile(fileId, userId);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}