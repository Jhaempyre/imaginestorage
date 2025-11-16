import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class RequestUploadTokenDto {
  @ApiProperty({
    description: 'Public API key for authentication',
    example: 'pk_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ApiProperty({
    description: 'Origin URL of the requesting application',
    example: 'https://example.com',
  })
  @IsString()
  @IsOptional()
  origin?: string;
}