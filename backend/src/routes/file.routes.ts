import { Router } from 'express';
import {
  uploadFileToCloud,
  getUserFiles,
  getFileById,
  getFileDownloadUrl,
  deleteFile,
  upload
} from '../controllers/file.controller';
import {
  verifyJWT,
  requireEmailVerification,
  rateLimitByUser
} from '../middlewares';

const router = Router();

/**
 * @route   POST /api/files/upload
 * @desc    Upload file to cloud storage
 * @access  Private
 * @body    multipart/form-data with 'file' field
 */
router.post(
  '/upload',
  verifyJWT,
  requireEmailVerification,
  rateLimitByUser(10, 60 * 60 * 1000), // 10 uploads per hour
  upload.single('file'),
  uploadFileToCloud
);

/**
 * @route   GET /api/files
 * @desc    Get user files with pagination
 * @access  Private
 * @query   { page?, limit? }
 */
router.get(
  '/',
  verifyJWT,
  getUserFiles
);

/**
 * @route   GET /api/files/:id
 * @desc    Get file by ID
 * @access  Private
 */
router.get(
  '/:id',
  verifyJWT,
  getFileById
);

/**
 * @route   GET /api/files/:id/download
 * @desc    Get file download URL
 * @access  Private
 */
router.get(
  '/:id/download',
  verifyJWT,
  getFileDownloadUrl
);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete file (soft delete)
 * @access  Private
 */
router.delete(
  '/:id',
  verifyJWT,
  deleteFile
);

export default router;