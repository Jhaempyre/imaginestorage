import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import fileRoutes from './file.routes';
// import storageRoutes from './storage.routes';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }, 'Server is running')
  );
});

// API version info
router.get('/version', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      version: '1.0.0',
      name: 'imaginaryStorage API',
      description: 'File storage and management API',
      author: 'Backend Team'
    }, 'API version information')
  );
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
// router.use('/storage', storageRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      endpoints: {
        authentication: {
          'POST /api/auth/register': 'Register a new user',
          'POST /api/auth/login': 'Login user',
          'POST /api/auth/logout': 'Logout user',
          'POST /api/auth/refresh-token': 'Refresh access token',
          'GET /api/auth/me': 'Get current user',
          'POST /api/auth/verify-email': 'Verify email address',
          'POST /api/auth/resend-verification': 'Resend verification email',
          'POST /api/auth/forgot-password': 'Request password reset',
          'POST /api/auth/reset-password': 'Reset password with token',
          'POST /api/auth/change-password': 'Change password'
        },
        users: {
          'GET /api/users/profile': 'Get user profile',
          'PUT /api/users/profile': 'Update user profile',
          'PUT /api/users/avatar': 'Update user avatar',
          'DELETE /api/users/account': 'Delete user account',
          'GET /api/users/stats': 'Get user statistics',
          'GET /api/users/files': 'Get user files',
          'GET /api/users/search': 'Search users (Admin)'
        },
        files: {
          'POST /api/files/upload': 'Upload file to cloud storage',
          'GET /api/files': 'Get user files with pagination',
          'GET /api/files/:id': 'Get file details by ID',
          'GET /api/files/:id/download': 'Get file download URL',
          'DELETE /api/files/:id': 'Delete file (soft delete)'
        },
        storage: {
          'GET /api/storage/status': 'Get storage provider status',
          'GET /api/storage/providers': 'Get available providers',
          'GET /api/storage/health': 'Test provider health',
          'POST /api/storage/switch': 'Switch storage provider',
          'POST /api/storage/initialize': 'Initialize provider with config'
        },
        utility: {
          'GET /api/health': 'Health check',
          'GET /api/version': 'API version info',
          'GET /api/docs': 'API documentation'
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        cookie: 'accessToken=<token>'
      },
      rateLimit: {
        register: '10 requests per 15 minutes',
        login: '5 requests per 15 minutes',
        emailVerification: '3 requests per hour',
        passwordReset: '3 requests per hour',
        userSearch: '50 requests per hour'
      }
    }, 'API documentation')
  );
});

export default router;