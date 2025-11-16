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
}