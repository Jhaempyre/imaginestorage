import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { File } from '../models/file';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AWSStorageProvider } from '../services/storage/providers/AWSStorageProvider';
import { StorageManager } from '../services/storage';

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// File filter for allowed file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'video/mp4',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024 // Convert MB to bytes
  }
});

// Helper function to generate unique filename
const generateUniqueFileName = (userId: string, originalName: string): string => {
  const fileExtension = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1E9);
  return `${timestamp}-${randomSuffix}${fileExtension}`;
};

/**
 * @desc    Upload file to cloud storage
 * @route   POST /api/files/upload
 * @access  Private
 */
export const uploadFileToCloud = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const tempFilePath = req.file.path;
  const originalName = req.file.originalname;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;
  const fileExtension = path.extname(originalName).toLowerCase();

  try {
    // Generate unique filename for cloud storage
    const uniqueFileName = generateUniqueFileName(userId.toString(), originalName);

    const storageProvider = new StorageManager('aws');

    storageProvider.initializeProvider('aws', {
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!,
        bucketName: process.env.AWS_S3_BUCKET!
      }
    });

    // Upload to cloud storage using the storage manager
    const uploadResult = await storageProvider.uploadFile({
      filePath: tempFilePath,
      fileName: uniqueFileName,
      userId: userId.toString(),
      mimeType,
      fileSize
    });

    // Save file metadata to database
    const fileDoc = new File({
      userId,
      originalName,
      fileName: uploadResult.fileName,
      fileSize,
      mimeType,
      fileExtension,
      storageProvider: storageProvider.getActiveProvider().type,
      storageLocation: uploadResult.storageLocation,
      isEncrypted: false,
      isPublic: false,
      metadata: {
        uploadedAt: new Date(),
        userAgent: req.headers['user-agent']
      }
    });

    await fileDoc.save();

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    res.status(201).json(
      new ApiResponse(201, {
        file: {
          id: fileDoc._id,
          originalName: fileDoc.originalName,
          fileName: fileDoc.fileName,
          fileSize: fileDoc.fileSize,
          mimeType: fileDoc.mimeType,
          storageProvider: fileDoc.storageProvider,
          storageLocation: fileDoc.storageLocation,
          createdAt: fileDoc.createdAt
        }
      }, 'File uploaded successfully')
    );

  } catch (error) {
    // Clean up temporary file in case of error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
});

/**
 * @desc    Get user files with pagination
 * @route   GET /api/files
 * @access  Private
 */
export const getUserFiles = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const files = await File.find({
    userId,
    deletedAt: null
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const totalFiles = await File.countDocuments({
    userId,
    deletedAt: null
  });

  res.status(200).json(
    new ApiResponse(200, {
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNextPage: page < Math.ceil(totalFiles / limit),
        hasPrevPage: page > 1
      }
    }, 'Files retrieved successfully')
  );
});

/**
 * @desc    Get file by ID
 * @route   GET /api/files/:id
 * @access  Private
 */
export const getFileById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const fileId = req.params.id;

  const file = await File.findOne({
    _id: fileId,
    userId,
    deletedAt: null
  }).select('-__v');

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  res.status(200).json(
    new ApiResponse(200, { file }, 'File retrieved successfully')
  );
});

/**
 * @desc    Get file download URL
 * @route   GET /api/files/:id/download
 * @access  Private
 */
export const getFileDownloadUrl = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  const fileId = req.params.id;

  const file = await File.findOne({
    _id: fileId,
    userId,
    deletedAt: null
  });

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  try {

    const storageProvider = new AWSStorageProvider();
    await storageProvider.initialize({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region: process.env.AWS_REGION!,
      bucketName: process.env.AWS_S3_BUCKET!
    });

    const downloadUrl = await storageProvider.getDownloadUrl({
      fileName: file.fileName,
      expiresIn: 3600, // 1 hour
      userId: userId.toString()
    });

    res.status(200).json(
      new ApiResponse(200, {
        downloadUrl,
        fileName: file.originalName,
        expiresIn: 3600
      }, 'Download URL generated successfully')
    );
  } catch (error) {
    throw new ApiError(500, 'Failed to generate download URL');
  }
});

/**
 * @desc    Delete file (soft delete)
 * @route   DELETE /api/files/:id
 * @access  Private
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const fileId = req.params.id;

  const file = await File.findOne({
    _id: fileId,
    userId,
    deletedAt: null
  });

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  // Soft delete
  file.deletedAt = new Date();
  await file.save();

  // Optionally delete from cloud storage (uncomment if you want hard delete)
  // try {
  //   await storageManager.deleteFile({ 
  //     fileName: file.fileName, 
  //     userId: userId.toString() 
  //   });
  // } catch (error) {
  //   console.error('Failed to delete file from cloud storage:', error);
  // }

  res.status(200).json(
    new ApiResponse(200, {}, 'File deleted successfully')
  );
});