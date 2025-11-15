import { ErrorCodeType } from "../constants/error-code.constansts";
import { NavigationControl } from "../interfaces/navigation.interface";
export declare class AppException extends Error {
    readonly statusCode: number;
    readonly code: ErrorCodeType;
    readonly userMessage: string;
    readonly details?: string;
    readonly suggestions?: string[];
    readonly navigation?: NavigationControl;
    constructor({ statusCode, code, message, userMessage, details, suggestions, navigation, }: {
        statusCode: number;
        code: ErrorCodeType;
        message: string;
        userMessage?: string;
        details?: string;
        suggestions?: string[];
        navigation?: NavigationControl;
    });
}
