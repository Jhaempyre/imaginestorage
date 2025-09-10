import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {}; // fallback to empty object
      }
    }
    return value;
  })
  metadata?: Record<string, any>;
}