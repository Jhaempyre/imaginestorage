import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadWithTokenDto {
  @ApiProperty({
    description: 'Upload token obtained from /upload/token endpoint',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({
    description: 'Folder path for file organization, should not start with /, to show root just send empty string',
    example: 'documents/images/',
    default: '',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || '')
  folderPath?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: Express.Multer.File;
}