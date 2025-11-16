import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from '../../schemas/api-key.schema';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyResponseDto, ApiKeyHistoryResponseDto, ApiKeyHistoryItemDto } from './dto/api-key-response.dto';
import { ConstraintsResponseDto } from './dto/constraints-response.dto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  /**
   * Generate a random 30-character API key
   */
  private generateApiKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 30; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Extract file extensions from MIME types
   */
  private extractExtensionsFromMimeTypes(mimeTypes: string[]): string[] {
    const mimeToExtensions: Record<string, string> = {
      'image/jpeg': '.jpg, .jpeg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/avi': '.avi',
      'video/mov': '.mov',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/zip': '.zip',
      'application/json': '.json',
      'text/csv': '.csv',
    };

    return mimeTypes.map(mime => mimeToExtensions[mime]).filter(Boolean);
  }

  /**
   * Mask API key for security display
   */
  private maskApiKey(key: string): string {
    if (key.length <= 10) return key;
    const start = key.slice(0, 6);
    const end = key.slice(-4);
    const middle = '*'.repeat(key.length - 10);
    return `${start}${middle}${end}`;
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    try {
      // Generate unique API key
      let apiKey: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        apiKey = this.generateApiKey();
        const existingKey = await this.apiKeyModel.findOne({ key: apiKey });
        isUnique = !existingKey;
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new ConflictException('Unable to generate unique API key. Please try again.');
        }
      } while (!isUnique);

      // Extract extensions from MIME types
      const allowedExtensions = this.extractExtensionsFromMimeTypes(createApiKeyDto.allowedMimeTypes);

      // Create API key document
      const newApiKey = new this.apiKeyModel({
        userId: new Types.ObjectId(userId),
        key: apiKey,
        maxFileSize: createApiKeyDto.maxFileSize,
        allowedMimeTypes: createApiKeyDto.allowedMimeTypes,
        allowedExtensions,
        isActive: true,
        usageCount: 0,
      });

      const savedApiKey = await newApiKey.save();

      this.logger.log(`API key created for user ${userId}`);

      return {
        key: savedApiKey.key,
        maxFileSize: savedApiKey.maxFileSize,
        allowedMimeTypes: savedApiKey.allowedMimeTypes,
        allowedExtensions: savedApiKey.allowedExtensions,
        isActive: savedApiKey.isActive,
        createdAt: savedApiKey.createdAt,
        usageCount: savedApiKey.usageCount,
        lastUsedAt: savedApiKey.lastUsedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create API key for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get API key history for a user
   */
  async getApiKeyHistory(userId: string): Promise<ApiKeyHistoryResponseDto> {
    try {
      const apiKeys = await this.apiKeyModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();

      const total = apiKeys.length;

      const history: ApiKeyHistoryItemDto[] = apiKeys.map((key) => ({
        id: key._id.toString(),
        maskedKey: this.maskApiKey(key.key),
        maxFileSize: key.maxFileSize,
        allowedMimeTypes: key.allowedMimeTypes,
        isActive: key.isActive,
        createdAt: key.createdAt,
        usageCount: key.usageCount,
        lastUsedAt: key.lastUsedAt,
        revokedAt: key.revokedAt,
      }));

      this.logger.log(`Retrieved API key history for user ${userId}: ${total} keys`);

      return {
        history,
        total,
      };
    } catch (error) {
      this.logger.error(`Failed to get API key history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    try {
      const apiKey = await this.apiKeyModel.findOne({
        _id: new Types.ObjectId(keyId),
        userId: new Types.ObjectId(userId),
      });

      if (!apiKey) {
        throw new NotFoundException('API key not found');
      }

      apiKey.isActive = false;
      apiKey.revokedAt = new Date();
      apiKey.revokedBy = new Types.ObjectId(userId);

      await apiKey.save();

      this.logger.log(`API key ${keyId} revoked by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke API key ${keyId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Validate and get API key details (for API usage)
   */
  async validateApiKey(key: string): Promise<ApiKeyDocument | null> {
    try {
      const apiKey = await this.apiKeyModel
        .findOne({ key, isActive: true })
        .populate('userId')
        .exec();

      if (apiKey) {
        // Update usage statistics
        apiKey.usageCount += 1;
        apiKey.lastUsedAt = new Date();
        await apiKey.save();
      }

      return apiKey;
    } catch (error) {
      this.logger.error(`Failed to validate API key:`, error);
      return null;
    }
  }

  async getConstraints(publicKey: string): Promise<ConstraintsResponseDto> {
    try {
      this.logger.log(`Getting constraints for public key: ${publicKey}`);
      
      // For now, return default constraints without database validation
      // This allows widget testing without requiring valid API keys
      // TODO: Add proper API key validation in production
      
      this.logger.log(`Returning default constraints for public key: ${publicKey}`);

      // Return standard constraints for file uploads
      return {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'audio/mp3',
          'audio/wav',
          'audio/ogg',
          'application/pdf',
          'text/plain',
          'application/json',
        ],
        allowedDomains: [], // No domain restrictions for now
        requireCaptcha: false,
      };
    } catch (error) {
      this.logger.error(`Failed to get constraints for public key ${publicKey}:`, error);
      throw error;
    }
  }
}