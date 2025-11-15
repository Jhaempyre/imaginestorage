import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty({
    description: 'Generated API key (30 characters)',
    example: 'abc123xyz789def456ghi123jkl456mn',
  })
  key: string;

  @ApiProperty({
    description: 'Maximum file size allowed in GB',
    example: 2.5,
  })
  maxFileSize: number;

  @ApiProperty({
    description: 'Array of allowed MIME types',
    example: ['image/jpeg', 'image/png', 'video/mp4'],
    isArray: true,
  })
  allowedMimeTypes: string[];

  @ApiProperty({
    description: 'Array of allowed file extensions',
    example: ['.jpg, .jpeg', '.png', '.mp4'],
    isArray: true,
  })
  allowedExtensions: string[];

  @ApiProperty({
    description: 'Whether the API key is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Usage count of the API key',
    example: 0,
  })
  usageCount: number;

  @ApiPropertyOptional({
    description: 'Last used timestamp',
    example: null,
  })
  lastUsedAt?: Date;
}

export class ApiKeyHistoryItemDto {
  @ApiProperty({
    description: 'API key ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Masked API key for security',
    example: 'abc123**********************456mn',
  })
  maskedKey: string;

  @ApiProperty({
    description: 'Maximum file size allowed in GB',
    example: 2.5,
  })
  maxFileSize: number;

  @ApiProperty({
    description: 'Array of allowed MIME types',
    example: ['image/jpeg', 'image/png'],
    isArray: true,
  })
  allowedMimeTypes: string[];

  @ApiProperty({
    description: 'Whether the API key is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Usage count of the API key',
    example: 5,
  })
  usageCount: number;

  @ApiPropertyOptional({
    description: 'Last used timestamp',
    example: '2024-01-15T14:22:00.000Z',
  })
  lastUsedAt?: Date;

  @ApiPropertyOptional({
    description: 'Revoked timestamp if revoked',
    example: null,
  })
  revokedAt?: Date;
}

export class ApiKeyHistoryResponseDto {
  @ApiProperty({
    description: 'Array of API key history items',
    type: [ApiKeyHistoryItemDto],
  })
  history: ApiKeyHistoryItemDto[];

  @ApiProperty({
    description: 'Total count of API keys',
    example: 10,
  })
  total: number;
}