/**
 * Storage Provider Constants
 */

export const STORAGE_PROVIDERS = {
  AWS: "aws",
  GCP: "gcp",
  AZURE: "azure",
  LOCAL: "local",
} as const;

/**
 * Storage Provider Metadata
 */
export const STORAGE_PROVIDER_METADATA = {
  [STORAGE_PROVIDERS.AWS]: {
    id: STORAGE_PROVIDERS.AWS,
    name: "Amazon S3",
    description: "Amazon Simple Storage Service",
    features: [
      "Global CDN",
      "99.999999999% durability",
      "Lifecycle policies",
      "Cross-region replication",
    ],
    requiredFields: ["accessKeyId", "secretAccessKey", "region", "bucketName"],
    fieldDefinitions: {
      accessKeyId: {
        name: "accessKeyId",
        label: "AWS Access Key ID",
        type: "text",
        required: true,
        description: "Your AWS access key ID from IAM",
        placeholder: "AKIAIOSFODNN7EXAMPLE",
      },
      secretAccessKey: {
        name: "secretAccessKey",
        label: "AWS Secret Access Key",
        type: "password",
        required: true,
        description: "Your AWS secret access key from IAM",
        placeholder: "Enter your secret access key",
      },
      region: {
        name: "region",
        label: "AWS Region",
        type: "select",
        required: true,
        description: "AWS region for your S3 bucket",
        options: [
          { label: "US East (N. Virginia)", value: "us-east-1" },
          { label: "US East (Ohio)", value: "us-east-2" },
          { label: "US West (N. California)", value: "us-west-1" },
          { label: "US West (Oregon)", value: "us-west-2" },
          { label: "Africa (Cape Town)", value: "af-south-1" },
          { label: "Asia Pacific (Hong Kong)", value: "ap-east-1" },
          { label: "Asia Pacific (Mumbai)", value: "ap-south-1" },
          { label: "Asia Pacific (Osaka)", value: "ap-northeast-3" },
          { label: "Asia Pacific (Seoul)", value: "ap-northeast-2" },
          { label: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
          { label: "Asia Pacific (Sydney)", value: "ap-southeast-2" },
          { label: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
          { label: "Canada (Central)", value: "ca-central-1" },
          { label: "China (Beijing)", value: "cn-north-1" },
          { label: "China (Ningxia)", value: "cn-northwest-1" },
          { label: "Europe (Frankfurt)", value: "eu-central-1" },
          { label: "Europe (Ireland)", value: "eu-west-1" },
          { label: "Europe (London)", value: "eu-west-2" },
          { label: "Europe (Milan)", value: "eu-south-1" },
          { label: "Europe (Paris)", value: "eu-west-3" },
          { label: "Europe (Stockholm)", value: "eu-north-1" },
          { label: "Middle East (Bahrain)", value: "me-south-1" },
          { label: "Middle East (UAE)", value: "me-central-1" },
          { label: "South America (São Paulo)", value: "sa-east-1" },
          { label: "AWS GovCloud (US-East)", value: "us-gov-east-1" },
          { label: "AWS GovCloud (US-West)", value: "us-gov-west-1" },
        ],
      },
      bucketName: {
        name: "bucketName",
        label: "S3 Bucket Name",
        type: "text",
        required: true,
        description:
          "Name of your S3 bucket (will be created if doesn't exist)",
        placeholder: "my-app-storage-bucket",
      },
    },
  },

  [STORAGE_PROVIDERS.GCP]: {
    id: STORAGE_PROVIDERS.GCP,
    name: "Google Cloud Storage",
    description: "Google Cloud Platform Storage",
    features: [
      "Global network",
      "Strong consistency",
      "IAM integration",
      "Multi-regional storage",
    ],
    requiredFields: ["projectId", "keyFile", "bucketName"],
    fieldDefinitions: {
      projectId: {
        name: "projectId",
        label: "GCP Project ID",
        type: "text",
        required: true,
        description: "Your Google Cloud Project ID",
        placeholder: "my-gcp-project-123",
      },
      keyFile: {
        name: "keyFile",
        label: "Service Account Key",
        type: "textarea",
        required: true,
        description: "JSON content of your service account key file",
        placeholder: "Paste your service account JSON key here",
      },
      bucketName: {
        name: "bucketName",
        label: "GCS Bucket Name",
        type: "text",
        required: true,
        description: "Name of your Google Cloud Storage bucket",
        placeholder: "my-gcs-bucket",
      },
    },
  },

  [STORAGE_PROVIDERS.AZURE]: {
    id: STORAGE_PROVIDERS.AZURE,
    name: "Azure Blob Storage",
    description: "Microsoft Azure Blob Storage",
    features: [
      "Hot/Cool/Archive tiers",
      "Azure integration",
      "Geo-redundancy",
      "Advanced security",
    ],
    requiredFields: ["accountName", "accountKey", "containerName"],
    fieldDefinitions: {
      accountName: {
        name: "accountName",
        label: "Storage Account Name",
        type: "text",
        required: true,
        description: "Your Azure Storage Account name",
        placeholder: "mystorageaccount",
      },
      accountKey: {
        name: "accountKey",
        label: "Account Key",
        type: "password",
        required: true,
        description: "Your Azure Storage Account key",
        placeholder: "Enter your account key",
      },
      containerName: {
        name: "containerName",
        label: "Container Name",
        type: "text",
        required: true,
        description: "Name of your Azure Blob container",
        placeholder: "my-container",
      },
    },
  },

  [STORAGE_PROVIDERS.LOCAL]: {
    id: STORAGE_PROVIDERS.LOCAL,
    name: "Local Storage",
    description: "Local file system storage",
    features: [
      "No external dependencies",
      "Full control",
      "No bandwidth costs",
      "Direct file access",
    ],
    requiredFields: ["storagePath"],
    fieldDefinitions: {
      storagePath: {
        name: "storagePath",
        label: "Storage Path",
        type: "text",
        required: true,
        description: "Local directory path for file storage",
        placeholder: "/var/www/storage",
      },
    },
  },
};

/**
 * Onboarding Steps
 */
export const ONBOARDING_STEPS = {
  CHOOSE_PROVIDER: "choose_provider",
  CONFIGURE_CREDENTIALS: "configure_credentials",
  COMPLETED: "completed",
} as const;

/**
 * Storage Validation Error Codes
 */
export const STORAGE_VALIDATION_ERRORS = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  BUCKET_NOT_FOUND: "BUCKET_NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Type definitions
 */
export type StorageProvider =
  (typeof STORAGE_PROVIDERS)[keyof typeof STORAGE_PROVIDERS];
export type OnboardingStep =
  (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS];
export type StorageValidationError =
  (typeof STORAGE_VALIDATION_ERRORS)[keyof typeof STORAGE_VALIDATION_ERRORS];
