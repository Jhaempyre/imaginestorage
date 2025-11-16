import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto, ApiKeyHistoryResponseDto } from './dto/api-key-response.dto';
import { ConstraintsResponseDto } from './dto/constraints-response.dto';

@ApiTags('API Keys')
@Controller('api-keys')

@ApiBearerAuth()
export class ApiKeysController {
  private readonly logger = new Logger(ApiKeysController.name);

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate a new API key',
    description: 'Creates a new API key with specified configuration for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'API key created successfully',
    type: ApiKeyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Unable to generate unique API key',
  })

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  async createApiKey(
    @Req() req: Request,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ): Promise<ApiResponseDto<ApiKeyResponseDto>> {
    try {
      const userId = req.user['_id'];
      this.logger.log(`Creating API key for user ${userId}`);

      const apiKey = await this.apiKeysService.createApiKey(
        userId,
        createApiKeyDto,
      );

      this.logger.log(`API key created successfully for user ${userId}`);

      return ApiResponseDto.success({
        message: 'API key generated successfully',
        data: apiKey,
      });
    } catch (error) {
      const userId = req.user['_id'];
      this.logger.error(`Failed to create API key for user ${userId}:`, error);
      throw error;
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get API key history',
    description: 'Retrieves the history of all API keys for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API key history retrieved successfully',
    type: ApiKeyHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  async getApiKeyHistory(
    @Req() req: Request,
  ): Promise<ApiResponseDto<ApiKeyHistoryResponseDto>> {
    try {
      const userId = req.user['_id'];
      this.logger.log(`Retrieving API key history for user ${userId}`);

      const history = await this.apiKeysService.getApiKeyHistory(userId);

      this.logger.log(`API key history retrieved for user ${userId}: ${history.total} keys`);

      return ApiResponseDto.success({
        message: 'API key history retrieved successfully',
        data: history,
      });
    } catch (error) {
      const userId = req.user['_id'];
      this.logger.error(`Failed to get API key history for user ${userId}:`, error);
      throw error;
    }
  }

  @Delete(':keyId')
  @ApiOperation({
    summary: 'Revoke an API key',
    description: 'Revokes (deactivates) an API key for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API key revoked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'API key not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  async revokeApiKey(
    @Req() req: Request,
    @Param('keyId') keyId: string,
  ): Promise<ApiResponseDto<null>> {
    try {
      const userId = req.user['_id'];
      this.logger.log(`Revoking API key ${keyId} for user ${userId}`);

      await this.apiKeysService.revokeApiKey(userId, keyId);

      this.logger.log(`API key ${keyId} revoked successfully for user ${userId}`);

      return ApiResponseDto.success({
        message: 'API key revoked successfully',
        data: null,
      });
    } catch (error) {
      const userId = req.user['_id'];
      this.logger.error(`Failed to revoke API key ${keyId} for user ${userId}:`, error);
      throw error;
    }
  }

  @Get('constraints/:publicKey')
  @ApiOperation({
    summary: 'Get upload constraints for public key',
    description: 'Returns upload constraints (file size limits, allowed types, etc.) for a given public API key',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload constraints retrieved successfully',
    type: ConstraintsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'API key not found',
  })
 // Override class-level guards to make this endpoint public
  async getConstraints(@Param('publicKey') publicKey: string): Promise<ConstraintsResponseDto> {
    try {
      this.logger.log(`Getting constraints for public key: ${publicKey}`);
      return await this.apiKeysService.getConstraints(publicKey);
    } catch (error) {
      this.logger.error(`Failed to get constraints for public key ${publicKey}:`, error);
      throw error;
    }
  }
}