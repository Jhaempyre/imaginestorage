import { ApiProperty } from '@nestjs/swagger';

export class ConstraintsResponseDto {
  @ApiProperty({
    description: 'Maximum file size allowed in bytes',
    example: 104857600, // 100MB
  })
  maxFileSize: number;

  @ApiProperty({
    description: 'Allowed MIME types for uploads',
    example: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    type: [String],
  })
  allowedMimeTypes: string[];

  @ApiProperty({
    description: 'Allowed domains for CORS',
    example: ['https://example.com', 'https://app.example.com'],
    type: [String],
  })
  allowedDomains: string[];

  @ApiProperty({
    description: 'Whether CAPTCHA is required for uploads',
    example: false,
  })
  requireCaptcha: boolean;
}