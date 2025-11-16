import { EventEmitter } from './events.js';
import { Config } from './config.js';
import { requestUploadToken } from '../api/requestToken.js';
import { uploadFile } from '../api/uploadFile.js';

export class WidgetCore extends EventEmitter {
  constructor(options) {
    super();
    
    if (!options.publicKey) {
      throw new Error('Public key is required');
    }

    this.config = new Config(options);
    this.isInitialized = false;
    this.currentToken = null;
    this.tokenExpiryTime = null;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Fetch constraints from server
      await this.config.fetchConstraints();
      this.isInitialized = true;
      this.emit('core:initialized', {
        constraints: {
          maxFileSize: this.config.maxFileSize,
          allowedMimeTypes: this.config.allowedMimeTypes,
          allowedDomains: this.config.allowedDomains,
          requireCaptcha: this.config.requireCaptcha
        }
      });
    } catch (error) {
      this.emit('core:error', { error: error.message });
      throw new Error(`Failed to initialize widget: ${error.message}`);
    }
  }

  async requestUploadToken() {
    try {
      // Check if we have a valid token
      if (this.currentToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
        return this.currentToken;
      }

      // Request new token
      const token = await requestUploadToken(this.config.apiUrl, this.config.publicKey);
      
      // Store token with expiry (assume 10 minutes validity)
      this.currentToken = token;
      this.tokenExpiryTime = Date.now() + (10 * 60 * 1000);

      this.emit('token:received', { token });
      return token;

    } catch (error) {
      this.emit('token:error', { error: error.message });
      throw new Error(`Failed to request upload token: ${error.message}`);
    }
  }

  async uploadFile(token, file, onProgress) {
    try {
      const result = await uploadFile(
        this.config.apiUrl,
        token,
        file,
        onProgress
      );

      return result;

    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  validateFile(file) {
    return this.config.validateFile(file);
  }

  getConstraints() {
    return {
      maxFileSize: this.config.maxFileSize,
      allowedMimeTypes: this.config.allowedMimeTypes,
      allowedDomains: this.config.allowedDomains,
      requireCaptcha: this.config.requireCaptcha
    };
  }

  reset() {
    this.currentToken = null;
    this.tokenExpiryTime = null;
    this.clear(); // Clear all event listeners
  }
}