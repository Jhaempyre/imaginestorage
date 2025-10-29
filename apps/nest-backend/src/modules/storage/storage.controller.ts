import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Get('status')
  @ApiOperation({ summary: 'Get storage provider status and statistics' })
  @ApiResponse({ status: 200, description: 'Storage status retrieved successfully' })
  async getStorageStatus(
    @Req() request: Request,
  ) {

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
}