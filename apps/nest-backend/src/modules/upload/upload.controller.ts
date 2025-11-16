import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUploadTokenDto } from './dto/request-upload-token.dto';
import { UploadTokenResponseDto } from './dto/upload-token-response.dto';
import { UploadWithTokenDto } from './dto/upload-with-token.dto';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('token')
  @ApiOperation({
    summary: 'Request upload token',
    description: 'Generates a temporary upload token using API key authentication for widget uploads',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload token generated successfully',
    type: UploadTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid API key or unauthorized access',
  })
  async requestUploadToken(
    @Body() requestTokenDto: RequestUploadTokenDto,
  ): Promise<ApiResponseDto<UploadTokenResponseDto>> {
    try {
      this.logger.log(`Requesting upload token for public key: ${requestTokenDto.publicKey}`);
      
      const tokenData = await this.uploadService.generateUploadToken(
        requestTokenDto.publicKey,
        requestTokenDto.origin,
      );

      this.logger.log(`Upload token generated successfully for public key: ${requestTokenDto.publicKey}`);

      return ApiResponseDto.success({
        message: 'Upload token generated successfully',
        data: tokenData,
      });
    } catch (error) {
      this.logger.error(`Failed to generate upload token for public key ${requestTokenDto.publicKey}:`, error);
      throw error;
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload file with token',
    description: 'Uploads a file using a temporary upload token generated from the token endpoint',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with token',
    type: UploadWithTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or upload failed',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadWithTokenDto,
  ): Promise<ApiResponseDto<UploadResponseDto>> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!uploadDto.token) {
        throw new BadRequestException('Upload token is required');
      }

      this.logger.log(`Uploading file with token: ${uploadDto.token.substring(0, 8)}...`);

      const uploadResult = await this.uploadService.uploadFileWithToken(
        file,
        uploadDto.token,
        uploadDto.folderPath,
      );

      this.logger.log(`File uploaded successfully: ${uploadResult.fileName}`);

      return ApiResponseDto.success({
        message: 'File uploaded successfully',
        data: uploadResult,
      });
    } catch (error) {
      this.logger.error(`Failed to upload file with token:`, error);
      throw error;
    }
  }
}