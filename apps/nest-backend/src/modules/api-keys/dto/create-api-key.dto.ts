import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsNotEmpty, Min, ArrayMinSize, IsIn } from 'class-validator';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/avi',
  'video/mov',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/json',
  'text/csv',
  
];

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Maximum file size allowed in GB',
    example: 2.5,
    minimum: 0.1,
  })
  @IsNumber({}, { message: 'Max file size must be a number' })
  @Min(0.1, { message: 'Max file size must be at least 0.1 GB' })
  maxFileSize: number;

  @ApiProperty({
    description: 'Array of allowed MIME types',
    example: ['image/jpeg', 'image/png', 'video/mp4'],
    isArray: true,
    enum: ALLOWED_MIME_TYPES,
  })
  @IsArray({ message: 'Allowed MIME types must be an array' })
  @ArrayMinSize(1, { message: 'At least one MIME type must be selected' })
  @IsString({ each: true, message: 'Each MIME type must be a string' })
  @IsIn(ALLOWED_MIME_TYPES, {
    each: true,
    message: `Each MIME type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  })
  allowedMimeTypes: string[];
}