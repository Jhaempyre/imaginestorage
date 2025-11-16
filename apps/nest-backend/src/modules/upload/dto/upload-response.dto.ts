import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the uploaded file',
    example: '507f1f77bcf86cd799439011',
  })
  fileId: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'document.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'Unique filename used in storage',
    example: 'document-1640995200000-123456789.pdf',
  })
  uniqueFileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'URL to access the uploaded file',
    example: 'https://storage.example.com/files/document-1640995200000-123456789.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2023-12-31T23:59:59.999Z',
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'Folder path where file was uploaded',
    example: 'documents/images/',
  })
  folderPath: string;
}