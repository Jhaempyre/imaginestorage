import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ShareFileDto {
  @ApiPropertyOptional({
    description: 'Number of hours until the share link expires',
    minimum: 1,
    maximum: 168, // 7 days
    default: 24,
    example: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  expiryHours?: number = 24;
}