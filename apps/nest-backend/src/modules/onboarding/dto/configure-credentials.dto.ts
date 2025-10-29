import {
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsString,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AWS Credentials DTO
 */
export class AWSCredentialsDto {
  @ApiProperty({
    description: 'AWS Access Key ID',
    example: 'AKIAIOSFODNN7EXAMPLE',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(16)
  @MaxLength(32)
  @Matches(/^AKIA[0-9A-Z]{16}$/, {
    message: 'Invalid AWS Access Key ID format'
  })
  accessKeyId: string;

  @ApiProperty({
    description: 'AWS Secret Access Key',
    example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(40)
  @MaxLength(40)
  secretAccessKey: string;

  @ApiProperty({
    description: 'AWS Region',
    example: 'us-east-1',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]{2}-[a-z]+-\d{1}$/, {
    message: 'Invalid AWS region format'
  })
  region: string;

  @ApiProperty({
    description: 'S3 Bucket Name',
    example: 'my-app-storage-bucket',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/, {
    message: 'Invalid S3 bucket name format'
  })
  bucketName: string;
}

/**
 * GCP Credentials DTO
 */
export class GCPCredentialsDto {
  @ApiProperty({
    description: 'GCP Project ID',
    example: 'my-gcp-project-123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  @Matches(/^[a-z][a-z0-9-]*[a-z0-9]$/, {
    message: 'Invalid GCP project ID format'
  })
  projectId: string;

  @ApiProperty({
    description: 'Service Account Key (JSON content)',
    example: '{"type": "service_account", "project_id": "..."}',
  })
  @IsString()
  @IsNotEmpty()
  keyFile: string;

  @ApiProperty({
    description: 'GCS Bucket Name',
    example: 'my-gcs-bucket',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  bucketName: string;
}

/**
 * Azure Credentials DTO
 */
export class AzureCredentialsDto {
  @ApiProperty({
    description: 'Azure Storage Account Name',
    example: 'mystorageaccount',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-z0-9]+$/, {
    message: 'Storage account name must contain only lowercase letters and numbers'
  })
  accountName: string;

  @ApiProperty({
    description: 'Azure Storage Account Key',
    example: 'DefaultEndpointsProtocol=https;AccountName=...',
  })
  @IsString()
  @IsNotEmpty()
  accountKey: string;

  @ApiProperty({
    description: 'Azure Blob Container Name',
    example: 'my-container',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'Invalid container name format'
  })
  containerName: string;
}

/**
 * Local Storage Credentials DTO
 */
export class LocalCredentialsDto {
  @ApiProperty({
    description: 'Local storage path',
    example: '/var/www/storage',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\/[a-zA-Z0-9/_-]+$/, {
    message: 'Invalid storage path format'
  })
  storagePath: string;
}

/**
 * Configure Credentials DTO
 */
export class ConfigureCredentialsDto {
  // @ApiProperty({ enum: ['aws', 'gcp', 'azure', 'local'] })
  // @IsEnum(['aws', 'gcp', 'azure', 'local'])
  // provider: 'aws' | 'gcp' | 'azure' | 'local';

  // @ValidateNested()
  // @Type((options) => {
  //   switch (options?.object?.provider) {
  //     case 'aws':
  //       return AWSCredentialsDto;
  //     case 'gcp':
  //       return GCPCredentialsDto;
  //     case 'azure':
  //       return AzureCredentialsDto;
  //     case 'local':
  //       return LocalCredentialsDto;
  //     default:
  //       return Object;
  //   }
  // })
  @ApiProperty({
    oneOf: [
      { $ref: '#/components/schemas/AWSCredentialsDto' },
      { $ref: '#/components/schemas/GCPCredentialsDto' },
      { $ref: '#/components/schemas/AzureCredentialsDto' },
      { $ref: '#/components/schemas/LocalCredentialsDto' },
    ]
  })
  @IsObject()
  @IsNotEmpty()
  credentials:
    | AWSCredentialsDto
    | GCPCredentialsDto
    | AzureCredentialsDto
    | LocalCredentialsDto;
}
