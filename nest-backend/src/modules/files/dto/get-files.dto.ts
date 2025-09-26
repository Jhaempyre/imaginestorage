import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetFilesDto extends PaginationDto {
  // @ApiPropertyOptional({
  //   description: 'Search term for file names',
  //   example: 'document',
  // })
  // @IsOptional()
  // @IsString()
  // search?: string;

  // @ApiPropertyOptional({
  //   description: 'Filter by MIME type',
  //   example: 'image/jpeg',
  // })
  // @IsOptional()
  // @IsString()
  // mimeType?: string;

  // @ApiPropertyOptional({
  //   description: 'Sort field',
  //   enum: ['createdAt', 'updatedAt', 'originalName', 'fileSize'],
  //   default: 'createdAt',
  // })
  // @IsOptional()
  // @IsIn(['createdAt', 'updatedAt', 'originalName', 'fileSize'])
  // sortBy?: string = 'createdAt';

  // @ApiPropertyOptional({
  //   description: 'Sort order',
  //   enum: ['asc', 'desc'],
  //   default: 'desc',
  // })
  // @IsOptional()
  // @IsIn(['asc', 'desc'])
  // sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Prefix for file names',
    example: '/folder/subfolder',
  })
  @IsOptional()
  @IsString()
  prefix?: string;

  // @ApiPropertyOptional({
  //   description: 'Maximum number of files to return',
  //   minimum: 1,
  //   maximum: 100,
  //   default: 10,
  //   example: 10,
  // })
  // maxKeys?: number = 10;
}