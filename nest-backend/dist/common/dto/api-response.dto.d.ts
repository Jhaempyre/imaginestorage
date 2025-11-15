import { ErrorCodeType } from '../constants/error-code.constansts';
import { NavigationControl } from '../interfaces/navigation.interface';
import { AppException } from './app-exception';
export declare class ApiResponseDto<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    navigation?: NavigationControl;
    error?: {
        code: ErrorCodeType;
        userMessage: string;
        details?: string;
        suggestions?: string[];
    };
    constructor(init: Partial<ApiResponseDto<T>>);
    static success<T>({ message, data, navigation, }: {
        message?: string;
        data: T;
        navigation?: NavigationControl;
    }): ApiResponseDto<T>;
    static error<T = null>({ message, errorCode, errorUserMessage, errorDetails, suggestions, navigation, }: {
        message: string;
        errorCode: ErrorCodeType;
        errorUserMessage: string;
        errorDetails?: string;
        suggestions?: string[];
        navigation?: NavigationControl;
    }): ApiResponseDto<T>;
    static fromException(exception: AppException): ApiResponseDto<any>;
}
export declare class PaginationDto {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    constructor(currentPage: number, totalItems: number, itemsPerPage: number);
}
export declare class NavigationControlDto {
    route: string;
    type: 'push' | 'replace';
    reason?: string;
    params?: Record<string, any>;
    state?: Record<string, any>;
}
