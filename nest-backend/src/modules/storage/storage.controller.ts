import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get storage provider status and statistics' })
  @ApiResponse({ status: 200, description: 'Storage status retrieved successfully' })
  async getStorageStatus() {
    const stats = this.storageService.getProviderStats();
    const healthChecks = await this.storageService.healthCheckAll();
    
    return {
      success: true,
      message: 'Storage status retrieved successfully',
      data: {
        stats,
        healthChecks,
        availableProviders: this.storageService.getAvailableProviders()
      },
    };
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get available storage providers and their capabilities' })
  @ApiResponse({ status: 200, description: 'Available storage providers retrieved successfully' })
  async getAvailableProviders() {
    const providers = this.storageService.getAvailableProviders();
    
    return {
      success: true,
      message: 'Available storage providers retrieved successfully',
      data: { providers },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Test storage provider health' })
  @ApiResponse({ status: 200, description: 'Storage health check completed' })
  async testStorageHealth() {
    const healthCheck = await this.storageService.healthCheck();
    
    return {
      success: true,
      message: 'Storage health check completed',
      data: healthCheck,
    };
  }

  @Post('switch')
  @ApiOperation({ summary: 'Switch storage provider' })
  @ApiResponse({ status: 200, description: 'Storage provider switched successfully' })
  async switchStorageProvider(@Body() body: { provider: string; config?: any }) {
    const { provider, config } = body;

    if (config) {
      await this.storageService.switchProvider(provider as any, config);
    } else {
      await this.storageService.switchProvider(provider as any);
    }

    const stats = this.storageService.getProviderStats();
    
    return {
      success: true,
      message: `Successfully switched to ${provider} storage provider`,
      data: {
        activeProvider: stats.active,
        stats
      },
    };
  }
}