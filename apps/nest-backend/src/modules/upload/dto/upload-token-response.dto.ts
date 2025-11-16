import { ApiProperty } from '@nestjs/swagger';

export class UploadTokenResponseDto {
  @ApiProperty({
    description: 'Temporary upload token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Token expiry time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Maximum file size allowed in bytes',
    example: 104857600, // 100MB
  })
  maxFileSize: number;

  @ApiProperty({
    description: 'Allowed file MIME types',
    example: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    type: [String],
  })
  allowedTypes: string[];
}