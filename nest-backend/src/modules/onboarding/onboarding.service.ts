import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ONBOARDING_STEPS,
  STORAGE_PROVIDER_METADATA,
  StorageProvider
} from '../../common/constants/storage.constants';
import {
  StorageCredentials,
  StorageValidationResult
} from '../../common/interfaces/storage.interface';
import { NavigationService } from '../../common/services/navigation.service';
import { UserStorageConfig, UserStorageConfigDocument } from '../../schemas/user-storage-config.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ChooseProviderDto } from './dto/choose-provider.dto';
import { ConfigureCredentialsDto } from './dto/configure-credentials.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStorageConfig.name) private storageConfigModel: Model<UserStorageConfigDocument>,
    private navigationService: NavigationService,
  ) { }

  /**
   * Get onboarding status for a user
   */
  async getOnboardingStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If onboarding is already complete
    if (user.isOnboardingComplete) {
      const storageConfig = await this.storageConfigModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true
      });

      return {
        isOnboardingComplete: true,
        currentStep: ONBOARDING_STEPS.COMPLETED,
        hasStorageConfig: !!storageConfig,
        storageProvider: storageConfig?.provider,
      };
    }

    // Check if user has started onboarding (has storage config but not completed)
    const existingConfig = await this.storageConfigModel.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (existingConfig && !existingConfig.isValidated) {
      // User has chosen provider but not configured credentials
      return {
        isOnboardingComplete: false,
        currentStep: ONBOARDING_STEPS.CONFIGURE_CREDENTIALS,
        hasStorageConfig: true,
        selectedProvider: existingConfig.provider,
        requiredFields: STORAGE_PROVIDER_METADATA[existingConfig.provider].fieldDefinitions,
      };
    }

    // User needs to start onboarding
    return {
      isOnboardingComplete: false,
      currentStep: ONBOARDING_STEPS.CHOOSE_PROVIDER,
      hasStorageConfig: false,
      availableProviders: Object.values(STORAGE_PROVIDER_METADATA),
    };
  }

  /**
   * Handle provider selection (Step 1)
   */
  async chooseProvider(userId: string, chooseProviderDto: ChooseProviderDto) {
    const { provider } = chooseProviderDto;

    // Validate provider exists
    if (!STORAGE_PROVIDER_METADATA[provider]) {
      throw new BadRequestException(`Unsupported storage provider: ${provider}`);
    }

    // Check if user already has a storage config
    const existingConfig = await this.storageConfigModel.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (existingConfig) {
      // Update existing config with new provider
      existingConfig.provider = provider;
      existingConfig.credentials = {}; // Reset credentials
      existingConfig.isValidated = false;
      existingConfig.validationError = null;
      await existingConfig.save();
    } else {
      // Create new storage config
      await this.storageConfigModel.create({
        userId: new Types.ObjectId(userId),
        provider,
        credentials: {},
        isValidated: false,
      });
    }

    const providerMetadata = STORAGE_PROVIDER_METADATA[provider];
    const navigation = this.navigationService.getOnboardingNavigation(ONBOARDING_STEPS.CHOOSE_PROVIDER);

    return {
      provider,
      requiredFields: Object.values(providerMetadata.fieldDefinitions),
      navigation,
    };
  }

  /**
   * Handle credentials configuration (Step 2)
   */
  async configureCredentials(userId: string, configureCredentialsDto: ConfigureCredentialsDto) {
    const { credentials } = configureCredentialsDto;

    // Get user's storage config
    const storageConfig = await this.storageConfigModel.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (!storageConfig) {
      throw new BadRequestException('No storage provider selected. Please choose a provider first.');
    }

    // Validate credentials format based on provider
    this.validateCredentialsFormat(storageConfig.provider, credentials);

    // Update storage config with credentials
    storageConfig.credentials = credentials;
    storageConfig.isValidated = false;
    storageConfig.validationError = null;

    try {
      // Validate credentials with the actual provider
      const validationResult = await this.validateCredentialsWithProvider(
        storageConfig.provider,
        credentials
      );

      if (!validationResult.isValid) {
        storageConfig.validationError = validationResult.error?.message || 'Validation failed';
        await storageConfig.save();

        const navigation = this.navigationService.getOnboardingNavigation(
          ONBOARDING_STEPS.CONFIGURE_CREDENTIALS,
          false
        );

        return {
          success: false,
          error: validationResult.error,
          navigation,
        };
      }

      // Mark as validated and complete onboarding
      storageConfig.isValidated = true;
      storageConfig.lastValidatedAt = new Date();
      await storageConfig.save();

      // Update user onboarding status
      await this.userModel.findByIdAndUpdate(userId, {
        isOnboardingComplete: true,
        onboardingCompletedAt: new Date(),
      });

      const navigation = this.navigationService.getOnboardingNavigation(ONBOARDING_STEPS.CONFIGURE_CREDENTIALS);

      return {
        success: true,
        provider: storageConfig.provider,
        isValidated: true,
        validatedAt: storageConfig.lastValidatedAt,
        storageInfo: validationResult.storageInfo,
        user: {
          isOnboardingComplete: true,
          onboardingCompletedAt: new Date(),
        },
        navigation,
      };

    } catch (error) {
      storageConfig.validationError = error.message;
      await storageConfig.save();

      throw new BadRequestException({
        message: 'Storage credentials validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.message,
          suggestions: this.getValidationSuggestions(storageConfig.provider),
        }
      });
    }
  }

  /**
   * Validate credentials format based on provider
   */
  private validateCredentialsFormat(provider: StorageProvider, credentials: StorageCredentials): void {
    const requiredFields = STORAGE_PROVIDER_METADATA[provider].requiredFields;
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields for ${provider}: ${missingFields.join(', ')}`
      );
    }

    // Provider-specific validation
    switch (provider) {
      case 'aws':
        this.validateAWSCredentials(credentials);
        break;
      case 'gcp':
        this.validateGCPCredentials(credentials);
        break;
      case 'azure':
        this.validateAzureCredentials(credentials);
        break;
      case 'local':
        this.validateLocalCredentials(credentials);
        break;
    }
  }

  /**
   * Validate AWS credentials format
   */
  private validateAWSCredentials(credentials: StorageCredentials): void {
    if (!credentials.accessKeyId?.match(/^AKIA[0-9A-Z]{16}$/)) {
      throw new BadRequestException('Invalid AWS Access Key ID format');
    }

    if (!credentials.secretAccessKey || credentials.secretAccessKey.length !== 40) {
      throw new BadRequestException('Invalid AWS Secret Access Key format');
    }

    if (!credentials.region?.match(/^[a-z]{2}-[a-z]+-\d{1}$/)) {
      throw new BadRequestException('Invalid AWS region format');
    }

    if (!credentials.bucketName?.match(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/)) {
      throw new BadRequestException('Invalid S3 bucket name format');
    }
  }

  /**
   * Validate GCP credentials format
   */
  private validateGCPCredentials(credentials: StorageCredentials): void {
    try {
      const keyFile = JSON.parse(credentials.keyFile || '');
      if (!keyFile.type || keyFile.type !== 'service_account') {
        throw new Error('Invalid service account key file');
      }
    } catch (error) {
      throw new BadRequestException('Invalid GCP service account key file format');
    }

    if (!credentials.projectId?.match(/^[a-z][a-z0-9-]*[a-z0-9]$/)) {
      throw new BadRequestException('Invalid GCP project ID format');
    }
  }

  /**
   * Validate Azure credentials format
   */
  private validateAzureCredentials(credentials: StorageCredentials): void {
    if (!credentials.accountName?.match(/^[a-z0-9]+$/)) {
      throw new BadRequestException('Invalid Azure storage account name format');
    }

    if (!credentials.containerName?.match(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)) {
      throw new BadRequestException('Invalid Azure container name format');
    }
  }

  /**
   * Validate local storage credentials
   */
  private validateLocalCredentials(credentials: StorageCredentials): void {
    if (!credentials.storagePath?.match(/^\/[a-zA-Z0-9/_-]+$/)) {
      throw new BadRequestException('Invalid storage path format');
    }
  }

  /**
   * Validate credentials with actual provider (mock implementation)
   * In real implementation, this would test actual connectivity
   */
  private async validateCredentialsWithProvider(
    provider: StorageProvider,
    credentials: StorageCredentials
  ): Promise<StorageValidationResult> {
    // Mock validation - in real implementation, test actual provider connectivity
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // For demo purposes, assume validation passes
    return {
      isValid: true,
      storageInfo: {
        bucketName: credentials.bucketName || credentials.containerName || 'storage',
        region: credentials.region || 'default',
        permissions: ['read', 'write', 'delete'],
        availableSpace: 'unlimited',
      },
    };
  }

  /**
   * Get validation suggestions based on provider
   */
  private getValidationSuggestions(provider: StorageProvider): string[] {
    const suggestions: Record<StorageProvider, string[]> = {
      aws: [
        'Verify your AWS Access Key ID and Secret Access Key',
        'Ensure the IAM user has S3 permissions',
        'Check if the bucket exists and is accessible',
        'Verify the AWS region is correct',
      ],
      gcp: [
        'Verify your GCP project ID is correct',
        'Ensure the service account has Storage permissions',
        'Check if the bucket exists and is accessible',
        'Verify the service account key file is valid',
      ],
      azure: [
        'Verify your Azure storage account name and key',
        'Ensure the storage account is active',
        'Check if the container exists and is accessible',
        'Verify the account key is correct',
      ],
      local: [
        'Verify the storage path exists',
        'Ensure the application has write permissions',
        'Check if the directory is accessible',
      ],
    };

    return suggestions[provider] || ['Please check your credentials and try again'];
  }
}