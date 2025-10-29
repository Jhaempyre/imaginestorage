import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationResponseDto {
  @ApiPropertyOptional({ description: 'Current page number' })
  currentPage: number;

  @ApiPropertyOptional({ description: 'Total number of pages' })
  totalPages: number;

  @ApiPropertyOptional({ description: 'Total number of items' })
  totalItems: number;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  itemsPerPage: number;

  @ApiPropertyOptional({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiPropertyOptional({ description: 'Whether there is a previous page' })
  hasPrevPage: boolean;
}