export interface CreateApiKeyRequest {
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface ApiKeyResponse {
  key: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  isActive: boolean;
  createdAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface ApiKeyHistoryItem {
  id: string;
  maskedKey: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  isActive: boolean;
  createdAt: string;
  usageCount: number;
  lastUsedAt?: string;
  revokedAt?: string;
}

export interface ApiKeyHistoryResponse {
  history: ApiKeyHistoryItem[];
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  navigation?: {
    route: string;
    type: 'push' | 'replace';
    reason?: string;
  };
  error?: {
    code: string;
    userMessage: string;
    details?: string;
    suggestions?: string[];
  };
}