import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): object {
    return {
      success: true,
      message: 'ImaginaryStorage API is running',
      version: '1.0.0',
      framework: 'NestJS',
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        auth: '/api/auth',
        users: '/api/users',
        files: '/api/files',
        storage: '/api/storage',
      },
    };
  }

  getHealth(): object {
    return {
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
    };
  }
}