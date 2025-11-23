import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EnvironmentVariables } from '../utils/validate-env';

interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly masterKey: Buffer;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    // Get master key from environment variable
    const key = this.configService.get('ENCRYPTION_MASTER_KEY');
    
    if (!key) {
      throw new Error('ENCRYPTION_MASTER_KEY must be set in environment variables');
    }

    // Convert hex string to buffer (32 bytes for AES-256)
    this.masterKey = Buffer.from(key, 'hex');
    
    if (this.masterKey.length !== 32) {
      throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes (64 hex characters)');
    }
  }

  /**
   * Encrypt any object to string format suitable for database storage
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random IV (12 bytes is standard for GCM)
      const iv = crypto.randomBytes(12);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine all parts into a single string (easier for MongoDB storage)
      const encryptedData: EncryptedData = {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted: encrypted
      };
      
      return JSON.stringify(encryptedData);
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt string from database back to original object
   */
  decrypt<T = any>(encryptedString: string): T {
    try {
      // Parse the encrypted data structure
      const encryptedData: EncryptedData = JSON.parse(encryptedString);
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse back to object
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a new master key (run this once to generate your ENCRYPTION_MASTER_KEY)
   */
  static generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// // Helper script to generate master key
// // Run: ts-node generate-key.ts
// if (require.main === module) {
//   console.log('Generated Master Key (add to .env):');
//   console.log(`ENCRYPTION_MASTER_KEY=${EncryptionService.generateMasterKey()}`);
// }