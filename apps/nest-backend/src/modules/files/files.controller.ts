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
import { GetFilesRequestDto } from "./dto/get-files-request.dto";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { CopyObjectsDto } from "./dto/copy-object.dto";
import { MoveObjectsDto } from "./dto/move-object.dto";
import { CreateSharingUrlDto } from "./dto/create-sharing-url.dto";
import { RenameDto } from "./dto/rename.dto";
import { ChangeVisibilityDto } from "./dto/toggle-visibility-dto";

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
  async getFiles(
    @Query() GetFilesRequestDto: GetFilesRequestDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const result = await this.filesService.getFiles(userId, GetFilesRequestDto);

    return ApiResponseDto.success({
      message: "Files.getFiles.success",
      data: result,
    });
  }

  @Get("/images")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all image files" })
  @ApiResponse({
    status: 200,
    description: "Image files retrieved successfully",
  })
  async getImageFiles(@Req() request: Request) {
    const userId = request.user["_id"];
    const images = await this.filesService.getImageFiles(userId);

    return ApiResponseDto.success({
      message: "Files.getImageFiles.success",
      data: images,
    });
  }

  @Get("/videos")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all video files" })
  @ApiResponse({
    status: 200,
    description: "Video files retrieved successfully",
  })
  async getVideoFiles(@Req() request: Request) {
    const userId = request.user["_id"];
    const videos = await this.filesService.getVideoFiles(userId);

    return ApiResponseDto.success({
      message: "Files.getVideoFiles.success",
      data: videos,
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

  @Post("/create-folder")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create folder" })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({ status: 200, description: "Folder created successfully" })
  @ApiResponse({ status: 400, description: "Invalid folder path" })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const result = await this.filesService.createFolder(
      userId,
      createFolderDto,
    );

    return ApiResponseDto.success({
      message: "Files.createFolder.success",
      data: result,
    });
  }

  @Post("/copy")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Copy multiple objects to a destination folder" })
  @ApiBody({ type: CopyObjectsDto })
  @ApiResponse({ status: 200, description: "Objects copied successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid source IDs or destination folder ID",
  })
  async copyObjects(
    @Body() copyObjectsDto: CopyObjectsDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const result = await this.filesService.copyObjects(userId, copyObjectsDto);

    return ApiResponseDto.success({
      message: "Files.copyObjects.success",
      data: result,
    });
  }

  @Post("/move")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Move multiple objects to a destination folder" })
  @ApiBody({ type: MoveObjectsDto })
  @ApiResponse({ status: 200, description: "Objects moved successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid source IDs or destination folder ID",
  })
  async moveObjects(
    @Body() moveObjectsDto: MoveObjectsDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const result = await this.filesService.moveObjects(userId, moveObjectsDto);

    return ApiResponseDto.success({
      message: "Files.moveObjects.success",
      data: result,
    });
  }

  @Post("/soft-delete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Soft delete multiple files/folders" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of file/folder IDs to soft delete",
        },
      },
      required: ["ids"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Files/folders soft deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid file/folder IDs" })
  async softDeleteObjects(@Body("ids") ids: string[], @Req() request: Request) {
    const userId = request.user["_id"];
    const result = await this.filesService.softDeleteObjects(userId, ids);

    return ApiResponseDto.success({
      message: "Files.softDeleteObjects.success",
      data: result,
    });
  }

  // @Post(':id/restore')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Restore a soft-deleted file/folder' })
  // @ApiParam({ name: 'id', description: 'File/Folder ID to restore' })
  // @ApiResponse({ status: 200, description: 'File/folder restored successfully' })
  // @ApiResponse({ status: 404, description: 'File/folder not found or not deleted' })
  // async restoreObject(
  //   @Param('id') id: string,
  //   @Req() request: Request,
  // ) {
  //   const userId = request.user['_id'];
  //   const restoredObject = await this.filesService.restoreObject(userId, id);

  //   return ApiResponseDto.success({
  //     message: 'Files.restoreObject.success',
  //     data: { object: restoredObject },
  //   });
  // }

  @Post("/permanent-delete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Permanently delete multiple soft-deleted files/folders",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of file/folder IDs to permanently delete",
        },
      },
      required: ["ids"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Files/folders permanently deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid file/folder IDs" })
  async hardDeleteObjects(@Body("ids") ids: string[], @Req() request: Request) {
    const userId = request.user["_id"];
    const result = await this.filesService.hardDeleteObjects(userId, ids);

    return ApiResponseDto.success({
      message: "Files.hardDeleteObjects.success",
      data: result,
    });
  }

  @Post("/create-sharing-url")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a sharing URL for a file" })
  @ApiBody({ type: CreateSharingUrlDto })
  @ApiResponse({ status: 200, description: "Sharing URL created successfully" })
  @ApiResponse({ status: 404, description: "File not found" })
  async createSharingUrl(
    @Body() createSharingUrlDto: CreateSharingUrlDto,
    @Req() request: Request,
  ) {
    const userId = request.user["_id"];
    const shareUrl = await this.filesService.createSharingUrl(
      userId,
      createSharingUrlDto,
    );
    return ApiResponseDto.success({
      message: "Files.createSharingUrl.success",
      data: { shareUrl },
    });
  }

  @Get("/details/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get file details" })
  @ApiParam({ name: "id", description: "File ID" })
  @ApiResponse({
    status: 200,
    description: "File details retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "File not found" })
  async getFileDetails(@Param("id") fileId: string, @Req() request: Request) {
    const userId = request.user["_id"];
    const file = await this.filesService.getDetails(userId, fileId);

    return ApiResponseDto.success({
      message: "Files.getFileDetails.success",
      data: file,
    });
  }

  @Patch("/rename/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Rename a file or folder" })
  @ApiBody({ type: RenameDto })
  @ApiResponse({
    status: 200,
    description: "File or folder renamed successfully",
  })
  @ApiResponse({ status: 404, description: "File or folder not found" })
  async renameObject(@Body() renameDto: RenameDto, @Req() request: Request) {
    const userId = request.user["_id"];
    const renamedObject = await this.filesService.renameObject(
      userId,
      renameDto,
    );

    return ApiResponseDto.success({
      message: "Files.renameObject.success",
      data: { object: renamedObject },
    });
  }

  @Patch("/change-visibility")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiBody({ type: ChangeVisibilityDto })
  @ApiOperation({ summary: "Change visibility of a file or folder" })
  @ApiResponse({ status: 200, description: "Visibility changed successfully" })
  @ApiResponse({ status: 404, description: "File or folder not found" })
  async changeVisibility(
    @Req() request: Request,
    @Body() dto: ChangeVisibilityDto,
  ) {
    const userId = request.user["_id"];
    const updatedObject = await this.filesService.changeVisibility(userId, dto);

    return ApiResponseDto.success({
      message: "Files.changeVisibility.success",
      data: { object: updatedObject },
    });
  }
}
