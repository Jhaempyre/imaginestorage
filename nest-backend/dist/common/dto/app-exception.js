"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppException = void 0;
class AppException extends Error {
    constructor({ statusCode, code, message, userMessage, details, suggestions, navigation, }) {
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
exports.AppException = AppException;
//# sourceMappingURL=app-exception.js.map