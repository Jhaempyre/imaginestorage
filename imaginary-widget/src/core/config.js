export class Config {
  constructor(options) {
    this.publicKey = options.publicKey;
    this.apiUrl = options.apiUrl || 'http://localhost:8000/api'; // Your backend URL
    this.maxFileSize = null; // Will be fetched from server
    this.allowedMimeTypes = null;
    this.allowedDomains = null;
    this.requireCaptcha = false;
  }

  async fetchConstraints() {
    try {
      const response = await fetch(`${this.apiUrl}/api-keys/constraints/${this.publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch constraints');
      
      const data = await response.json();
      this.maxFileSize = data.maxFileSize;
      this.allowedMimeTypes = data.allowedMimeTypes;
      this.allowedDomains = data.allowedDomains;
      this.requireCaptcha = data.requireCaptcha;
      
      return data;
    } catch (error) {
      console.error('Error fetching constraints:', error);
      throw error;
    }
  }

  validateFile(file) {
    const errors = [];

    // Check file size
    if (this.maxFileSize && file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatBytes(this.maxFileSize)}`);
    }

    // Check MIME type
    if (this.allowedMimeTypes && this.allowedMimeTypes.length > 0) {
      if (!this.allowedMimeTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}