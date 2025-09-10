import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NavigationControl } from '../interfaces/navigation.interface';

/**
 * Standard API Response DTO with Navigation
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiPropertyOptional({ 
    description: 'Navigation instructions for frontend',
    example: {
      route: '/dashboard',
      type: 'replace',
      reason: 'onboarding_completed'
    }
  })
  navigation?: NavigationControl;

  @ApiPropertyOptional({ 
    description: 'Error details (if success is false)',
    example: {
      code: 'INVALID_CREDENTIALS',
      details: 'The provided credentials are invalid',
      suggestions: ['Check your access key', 'Verify permissions']
    }
  })
  error?: {
    code: string;
    details: string;
    suggestions?: string[];
  };

  constructor(
    success: boolean,
    message: string,
    data: T,
    navigation?: NavigationControl,
    error?: { code: string; details: string; suggestions?: string[] }
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.navigation = navigation;
    this.error = error;
  }

  /**
   * Create a successful response with navigation
   */
  static success<T>(
    message: string,
    data: T,
    navigation?: NavigationControl
  ): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, navigation);
  }

  /**
   * Create an error response with navigation
   */
  static error<T = null>(
    message: string,
    errorCode: string,
    errorDetails: string,
    suggestions?: string[],
    navigation?: NavigationControl
  ): ApiResponseDto<T> {
    return new ApiResponseDto(
      false,
      message,
      null as T,
      navigation,
      {
        code: errorCode,
        details: errorDetails,
        suggestions,
      }
    );
  }
}

/**
 * Pagination Response DTO
 */
export class PaginationDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  totalItems: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPrevPage: boolean;

  constructor(
    currentPage: number,
    totalItems: number,
    itemsPerPage: number
  ) {
    this.currentPage = currentPage;
    this.totalItems = totalItems;
    this.itemsPerPage = itemsPerPage;
    this.totalPages = Math.ceil(totalItems / itemsPerPage);
    this.hasNextPage = currentPage < this.totalPages;
    this.hasPrevPage = currentPage > 1;
  }
}

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