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
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { Request } from "express";
import { FilesService } from "./files.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UploadFileDto } from "./dto/upload-file.dto";
import { ShareFileDto } from "./dto/share-file.dto";
import { GetFilesDto } from "./dto/get-files.dto";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import { CreateFolderDto } from "./dto/create-folder.dto";

@ApiTags("Files")
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Upload file to cloud storage" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "File to upload",
        },
        folderPath: {
          type: "string",
          description:
            "Folder path (will be auto-normalized to start and end with /)",
          default: "/",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({ status: 201, description: "File uploaded successfully" })
  @ApiResponse({ status: 400, description: "Invalid file or upload failed" })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const uploadedFile = await this.filesService.uploadFile(
      file,
      userId,
      uploadFileDto,
    );

    return ApiResponseDto.success({
      message: "Files.uploadFile.success",
      data: {
        file: uploadedFile,
      },
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get user files with pagination and filtering" })
  @ApiResponse({ status: 200, description: "Files retrieved successfully" })
  async getFiles(@Query() getFilesDto: GetFilesDto, @Req() request: Request) {
    const userId = request.user["_id"];
    const result = await this.filesService.getFiles(userId, getFilesDto);

    return ApiResponseDto.success({
      message: "Files.getFiles.success",
      data: result,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get file details by ID" })
  @ApiParam({ name: "id", description: "File ID" })
  @ApiResponse({
    status: 200,
    description: "File details retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "File not found" })
  async getFileById(@Param("id") fileId: string, @Req() request: Request) {
    const userId = request.user["_id"];
    const file = await this.filesService.getFileById(fileId, userId);

    return ApiResponseDto.success({
      message: "Files.getFileById.success",
      data: { file },
    });
  }

  @Post('/create-folder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create folder' })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({ status: 200, description: 'Folder created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid folder path' })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.filesService.createFolder(userId, createFolderDto);

    return ApiResponseDto.success({
      message: 'Files.createFolder.success',
      data: result,
    });
  }

  // @Get('public/:id')
  // @ApiOperation({ summary: 'Get public file details' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiResponse({ status: 200, description: 'Public file details retrieved successfully' })
  // @ApiResponse({ status: 404, description: 'Public file not found' })
  // async getPublicFile(@Param('id') fileId: string) {
  //   const file = await this.filesService.getPublicFile(fileId);

  //   return ApiResponseDto.success({
  //     message: 'Files.getPublicFile.success',
  //     data: { file },
  //   });
  // }

  // @Get('shared/:token')
  // @ApiOperation({ summary: 'Get shared file details by token' })
  // @ApiParam({ name: 'token', description: 'Share token' })
  // @ApiResponse({ status: 200, description: 'Shared file details retrieved successfully' })
  // @ApiResponse({ status: 404, description: 'Shared file not found' })
  // @ApiResponse({ status: 400, description: 'Share link has expired' })
  // async getSharedFile(@Param('token') shareToken: string) {
  //   const file = await this.filesService.getSharedFile(shareToken);

  //   return ApiResponseDto.success({
  //     message: 'Files.getSharedFile.success',
  //     data: { file },
  //   });
  // }

  // @Get(':id/download')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Get file download URL' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  // @ApiResponse({ status: 404, description: 'File not found' })
  // async getDownloadUrl(
  //   @Param('id') fileId: string,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   const result = await this.filesService.getDownloadUrl(fileId, userId);

  //   return ApiResponseDto.success({
  //     message: 'Files.getDownloadUrl.success',
  //     data: result,
  //   });
  // }

  // @Get('public/:id/download')
  // @ApiOperation({ summary: 'Get public file download URL' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiResponse({ status: 200, description: 'Public download URL generated successfully' })
  // @ApiResponse({ status: 404, description: 'Public file not found' })
  // async getPublicDownloadUrl(
  //   @Param('id') fileId: string,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   const result = await this.filesService.getPublicDownloadUrl(userId, fileId);

  //   return ApiResponseDto.success({
  //     message: 'Files.getPublicDownloadUrl.success',
  //     data: result,
  //   });
  // }

  // @Get('shared/:token/download')
  // @ApiOperation({ summary: 'Get shared file download URL' })
  // @ApiParam({ name: 'token', description: 'Share token' })
  // @ApiResponse({ status: 200, description: 'Shared download URL generated successfully' })
  // @ApiResponse({ status: 404, description: 'Shared file not found' })
  // @ApiResponse({ status: 400, description: 'Share link has expired' })
  // async getSharedDownloadUrl(
  //   @Req() request: Request,
  //   @Param('token') shareToken: string) {
  //   const userId = request.user['_id'];
  //   const result = await this.filesService.getSharedDownloadUrl(userId, shareToken);

  //   return ApiResponseDto.success({
  //     message: 'Files.getSharedDownloadUrl.success',
  //     data: result,
  //   });
  // }

  // @Post(':id/share')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Generate share link for file' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiResponse({ status: 200, description: 'Share link generated successfully' })
  // @ApiResponse({ status: 404, description: 'File not found' })
  // async shareFile(
  //   @Param('id') fileId: string,
  //   @Body() shareFileDto: ShareFileDto,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   const result = await this.filesService.shareFile(fileId, userId, shareFileDto);

  //   return ApiResponseDto.success({
  //     message: 'Files.shareFile.success',
  //     data: result,
  //   });
  // }

  // @Patch(':id/visibility')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Update file visibility (public/private)' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       isPublic: {
  //         type: 'boolean',
  //         description: 'Whether the file should be public',
  //       },
  //     },
  //     required: ['isPublic'],
  //   },
  // })
  // @ApiResponse({ status: 200, description: 'File visibility updated successfully' })
  // @ApiResponse({ status: 404, description: 'File not found' })
  // async updateFileVisibility(
  //   @Param('id') fileId: string,
  //   @Body('isPublic') isPublic: boolean,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   const file = await this.filesService.updateFileVisibility(fileId, userId, isPublic);

  //   return ApiResponseDto.success({
  //     message: 'Files.updateFileVisibility.success',
  //     data: { file },
  //   });
  // }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Delete file (soft delete)' })
  // @ApiParam({ name: 'id', description: 'File ID' })
  // @ApiResponse({ status: 200, description: 'File deleted successfully' })
  // @ApiResponse({ status: 404, description: 'File not found' })
  // async deleteFile(
  //   @Param('id') fileId: string,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   await this.filesService.deleteFile(fileId, userId);

  //   return ApiResponseDto.success({
  //     message: 'Files.deleteFile.success',
  //     data: null,
  //   });
  // }
}
