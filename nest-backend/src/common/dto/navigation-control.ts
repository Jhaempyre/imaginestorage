import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * Navigation Control DTO for Swagger documentation
 */
export class NavigationControlDto {
  @ApiProperty({
    description: 'Target route to navigate to',
    example: '/dashboard'
  })
  route: string;

  @ApiProperty({
    description: 'Navigation type',
    enum: ['push', 'replace'],
    example: 'replace'
  })
  type: 'push' | 'replace';

  @ApiPropertyOptional({
    description: 'Reason for navigation',
    example: 'onboarding_completed'
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Route parameters',
    example: { id: '123' }
  })
  params?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'State to pass with navigation',
    example: { from: 'onboarding' }
  })
  state?: Record<string, any>;
}