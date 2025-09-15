import { ArgumentsHost, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from '../constants/error-code.constansts';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AppException } from '../dto/app-exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppException) {
      const apiResponse = ApiResponseDto.fromException(exception);
      return response.status(exception.statusCode).json(apiResponse);
    }

    // if (exception instanceof UnauthorizedException) {
    //   const apiResponse = ApiResponseDto.error({
    //     message: 'Unauthorized',
    //     errorCode: ERROR_CODES.UNAUTHORIZED,
    //     errorUserMessage: 'You don\'t have permission to perform this action',
    //     errorDetails: 'Please log in to continue.',
    //   });
    //   return response.status(exception.getStatus()).json(apiResponse);
    // }

    // TODO: support more error types:
    

    // Handle unknown errors safely
    const apiResponse = ApiResponseDto.fromException(
      new AppException({
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
        userMessage: "Something went wrong. Please try again later.",
      })
    );
    return response.status(500).json(apiResponse);
  }
}
