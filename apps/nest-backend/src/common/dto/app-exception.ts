import { ErrorCodeType } from "../constants/error-code.constansts";
import { NavigationControl } from "../interfaces/navigation.interface";

/**
 * App-level exception that enforces consistent structure.
 */
export class AppException extends Error {
  readonly statusCode: number;
  readonly code: ErrorCodeType;
  readonly userMessage: string;
  readonly details?: string;
  readonly suggestions?: string[];
  readonly navigation?: NavigationControl;

  constructor({
    statusCode,
    code,
    message,
    userMessage,
    details,
    suggestions,
    navigation,
  }: {
    statusCode: number;
    code: ErrorCodeType; // e.g., 'INVALID_CREDENTIALS'
    message: string; // internal message (for logs)
    userMessage?: string; // frontend-friendly
    details?: string;
    suggestions?: string[];
    navigation?: NavigationControl;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage ?? message;
    this.details = details;
    this.suggestions = suggestions;
    this.navigation = navigation;

    Object.setPrototypeOf(this, AppException.prototype);
  }
}
