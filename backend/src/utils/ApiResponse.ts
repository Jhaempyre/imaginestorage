/**
 * Standardized API Response class
 * Provides consistent response structure across the application
 */
export class ApiResponse {
  public statusCode: number;
  public data: any;
  public message: string;
  public success: boolean;

  constructor(statusCode: number, data: any, message: string = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

/**
 * Helper function to create success response
 */
export const successResponse = (data: any, message: string = 'Success', statusCode: number = 200) => {
  return new ApiResponse(statusCode, data, message);
};

/**
 * Helper function to create created response
 */
export const createdResponse = (data: any, message: string = 'Created successfully') => {
  return new ApiResponse(201, data, message);
};

/**
 * Helper function to create no content response
 */
export const noContentResponse = (message: string = 'No content') => {
  return new ApiResponse(204, null, message);
};