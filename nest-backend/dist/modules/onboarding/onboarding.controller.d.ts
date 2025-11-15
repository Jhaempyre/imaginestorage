import { Request } from 'express';
import { OnboardingService } from './onboarding.service';
import { ChooseProviderDto } from './dto/choose-provider.dto';
import { ConfigureCredentialsDto } from './dto/configure-credentials.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    getOnboardingStatus(request: Request): Promise<ApiResponseDto<{
        isOnboardingComplete: boolean;
        currentStep: "completed";
        hasStorageConfig: boolean;
        storageProvider: import("../../common/constants/storage.constants").StorageProvider;
        availableProviders?: undefined;
        selectedProvider?: undefined;
        requiredFields?: undefined;
    } | {
        isOnboardingComplete: boolean;
        currentStep: "choose_provider";
        hasStorageConfig: boolean;
        availableProviders: ({
            readonly id: "aws";
            readonly name: "Amazon S3";
            readonly description: "Amazon Simple Storage Service";
            readonly features: readonly ["Global CDN", "99.999999999% durability", "Lifecycle policies", "Cross-region replication"];
            readonly requiredFields: readonly ["accessKeyId", "secretAccessKey", "region", "bucketName"];
            readonly fieldDefinitions: {
                readonly accessKeyId: {
                    readonly name: "accessKeyId";
                    readonly label: "AWS Access Key ID";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Your AWS access key ID from IAM";
                    readonly placeholder: "AKIAIOSFODNN7EXAMPLE";
                };
                readonly secretAccessKey: {
                    readonly name: "secretAccessKey";
                    readonly label: "AWS Secret Access Key";
                    readonly type: "password";
                    readonly required: true;
                    readonly description: "Your AWS secret access key from IAM";
                    readonly placeholder: "Enter your secret access key";
                };
                readonly region: {
                    readonly name: "region";
                    readonly label: "AWS Region";
                    readonly type: "select";
                    readonly required: true;
                    readonly description: "AWS region for your S3 bucket";
                    readonly options: readonly [{
                        readonly value: "us-east-1";
                        readonly label: "US East (N. Virginia)";
                    }, {
                        readonly value: "us-west-2";
                        readonly label: "US West (Oregon)";
                    }, {
                        readonly value: "eu-west-1";
                        readonly label: "Europe (Ireland)";
                    }, {
                        readonly value: "ap-south-1";
                        readonly label: "Asia Pacific (Mumbai)";
                    }, {
                        readonly value: "ap-southeast-1";
                        readonly label: "Asia Pacific (Singapore)";
                    }];
                };
                readonly bucketName: {
                    readonly name: "bucketName";
                    readonly label: "S3 Bucket Name";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Name of your S3 bucket (will be created if doesn't exist)";
                    readonly placeholder: "my-app-storage-bucket";
                };
            };
        } | {
            readonly id: "gcp";
            readonly name: "Google Cloud Storage";
            readonly description: "Google Cloud Platform Storage";
            readonly features: readonly ["Global network", "Strong consistency", "IAM integration", "Multi-regional storage"];
            readonly requiredFields: readonly ["projectId", "keyFile", "bucketName"];
            readonly fieldDefinitions: {
                readonly projectId: {
                    readonly name: "projectId";
                    readonly label: "GCP Project ID";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Your Google Cloud Project ID";
                    readonly placeholder: "my-gcp-project-123";
                };
                readonly keyFile: {
                    readonly name: "keyFile";
                    readonly label: "Service Account Key";
                    readonly type: "textarea";
                    readonly required: true;
                    readonly description: "JSON content of your service account key file";
                    readonly placeholder: "Paste your service account JSON key here";
                };
                readonly bucketName: {
                    readonly name: "bucketName";
                    readonly label: "GCS Bucket Name";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Name of your Google Cloud Storage bucket";
                    readonly placeholder: "my-gcs-bucket";
                };
            };
        } | {
            readonly id: "azure";
            readonly name: "Azure Blob Storage";
            readonly description: "Microsoft Azure Blob Storage";
            readonly features: readonly ["Hot/Cool/Archive tiers", "Azure integration", "Geo-redundancy", "Advanced security"];
            readonly requiredFields: readonly ["accountName", "accountKey", "containerName"];
            readonly fieldDefinitions: {
                readonly accountName: {
                    readonly name: "accountName";
                    readonly label: "Storage Account Name";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Your Azure Storage Account name";
                    readonly placeholder: "mystorageaccount";
                };
                readonly accountKey: {
                    readonly name: "accountKey";
                    readonly label: "Account Key";
                    readonly type: "password";
                    readonly required: true;
                    readonly description: "Your Azure Storage Account key";
                    readonly placeholder: "Enter your account key";
                };
                readonly containerName: {
                    readonly name: "containerName";
                    readonly label: "Container Name";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Name of your Azure Blob container";
                    readonly placeholder: "my-container";
                };
            };
        } | {
            readonly id: "local";
            readonly name: "Local Storage";
            readonly description: "Local file system storage";
            readonly features: readonly ["No external dependencies", "Full control", "No bandwidth costs", "Direct file access"];
            readonly requiredFields: readonly ["storagePath"];
            readonly fieldDefinitions: {
                readonly storagePath: {
                    readonly name: "storagePath";
                    readonly label: "Storage Path";
                    readonly type: "text";
                    readonly required: true;
                    readonly description: "Local directory path for file storage";
                    readonly placeholder: "/var/www/storage";
                };
            };
        })[];
        storageProvider?: undefined;
        selectedProvider?: undefined;
        requiredFields?: undefined;
    } | {
        isOnboardingComplete: boolean;
        currentStep: "configure_credentials";
        hasStorageConfig: boolean;
        selectedProvider: import("../../common/constants/storage.constants").StorageProvider;
        requiredFields: {
            readonly accessKeyId: {
                readonly name: "accessKeyId";
                readonly label: "AWS Access Key ID";
                readonly type: "text";
                readonly required: true;
                readonly description: "Your AWS access key ID from IAM";
                readonly placeholder: "AKIAIOSFODNN7EXAMPLE";
            };
            readonly secretAccessKey: {
                readonly name: "secretAccessKey";
                readonly label: "AWS Secret Access Key";
                readonly type: "password";
                readonly required: true;
                readonly description: "Your AWS secret access key from IAM";
                readonly placeholder: "Enter your secret access key";
            };
            readonly region: {
                readonly name: "region";
                readonly label: "AWS Region";
                readonly type: "select";
                readonly required: true;
                readonly description: "AWS region for your S3 bucket";
                readonly options: readonly [{
                    readonly value: "us-east-1";
                    readonly label: "US East (N. Virginia)";
                }, {
                    readonly value: "us-west-2";
                    readonly label: "US West (Oregon)";
                }, {
                    readonly value: "eu-west-1";
                    readonly label: "Europe (Ireland)";
                }, {
                    readonly value: "ap-south-1";
                    readonly label: "Asia Pacific (Mumbai)";
                }, {
                    readonly value: "ap-southeast-1";
                    readonly label: "Asia Pacific (Singapore)";
                }];
            };
            readonly bucketName: {
                readonly name: "bucketName";
                readonly label: "S3 Bucket Name";
                readonly type: "text";
                readonly required: true;
                readonly description: "Name of your S3 bucket (will be created if doesn't exist)";
                readonly placeholder: "my-app-storage-bucket";
            };
        } | {
            readonly projectId: {
                readonly name: "projectId";
                readonly label: "GCP Project ID";
                readonly type: "text";
                readonly required: true;
                readonly description: "Your Google Cloud Project ID";
                readonly placeholder: "my-gcp-project-123";
            };
            readonly keyFile: {
                readonly name: "keyFile";
                readonly label: "Service Account Key";
                readonly type: "textarea";
                readonly required: true;
                readonly description: "JSON content of your service account key file";
                readonly placeholder: "Paste your service account JSON key here";
            };
            readonly bucketName: {
                readonly name: "bucketName";
                readonly label: "GCS Bucket Name";
                readonly type: "text";
                readonly required: true;
                readonly description: "Name of your Google Cloud Storage bucket";
                readonly placeholder: "my-gcs-bucket";
            };
        } | {
            readonly accountName: {
                readonly name: "accountName";
                readonly label: "Storage Account Name";
                readonly type: "text";
                readonly required: true;
                readonly description: "Your Azure Storage Account name";
                readonly placeholder: "mystorageaccount";
            };
            readonly accountKey: {
                readonly name: "accountKey";
                readonly label: "Account Key";
                readonly type: "password";
                readonly required: true;
                readonly description: "Your Azure Storage Account key";
                readonly placeholder: "Enter your account key";
            };
            readonly containerName: {
                readonly name: "containerName";
                readonly label: "Container Name";
                readonly type: "text";
                readonly required: true;
                readonly description: "Name of your Azure Blob container";
                readonly placeholder: "my-container";
            };
        } | {
            readonly storagePath: {
                readonly name: "storagePath";
                readonly label: "Storage Path";
                readonly type: "text";
                readonly required: true;
                readonly description: "Local directory path for file storage";
                readonly placeholder: "/var/www/storage";
            };
        };
        storageProvider?: undefined;
        availableProviders?: undefined;
    }>>;
    chooseProvider(chooseProviderDto: ChooseProviderDto, request: Request): Promise<ApiResponseDto<{
        provider: import("../../common/constants/storage.constants").StorageProvider;
        requiredFields: any[];
        navigation: {
            route: "/onboarding/step-2";
            type: "push";
        };
    }>>;
    configureCredentials(configureCredentialsDto: ConfigureCredentialsDto, request: Request): Promise<ApiResponseDto<{
        success: boolean;
        provider: import("../../common/constants/storage.constants").StorageProvider;
        isValidated: boolean;
        validatedAt: Date;
        storageInfo: {
            [key: string]: any;
            bucketName?: string;
            region?: string;
            permissions?: string[];
            availableSpace?: string;
        };
        user: {
            isOnboardingComplete: boolean;
            onboardingCompletedAt: Date;
        };
        navigation: import("../../common/interfaces/navigation.interface").NavigationControl;
    }>>;
}
