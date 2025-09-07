import { IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Whether the file should be public',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional metadata for the file',
    example: { description: 'My important document', tags: ['work', 'document'] },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}