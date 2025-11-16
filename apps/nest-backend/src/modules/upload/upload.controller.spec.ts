import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    generateUploadToken: jest.fn(),
    uploadFileWithToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestUploadToken', () => {
    it('should generate upload token successfully', async () => {
      const mockTokenResponse = {
        token: 'mock-token',
        expiresIn: 3600,
        maxFileSize: 100 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'],
      };

      mockUploadService.generateUploadToken.mockResolvedValue(mockTokenResponse);

      const result = await controller.requestUploadToken({
        publicKey: 'pk_test_123',
        origin: 'https://example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTokenResponse);
      expect(mockUploadService.generateUploadToken).toHaveBeenCalledWith(
        'pk_test_123',
        'https://example.com',
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully with valid token', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
      } as Express.Multer.File;

      const mockUploadResponse = {
        fileId: 'file-id-123',
        fileName: 'test.jpg',
        uniqueFileName: 'test-123456789.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        fileUrl: 'https://storage.example.com/test-123456789.jpg',
        uploadedAt: new Date(),
        folderPath: 'images/',
      };

      mockUploadService.uploadFileWithToken.mockResolvedValue(mockUploadResponse);

      const result = await controller.uploadFile(mockFile, {
        token: 'valid-token',
        folderPath: 'images/',
        file: mockFile,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUploadResponse);
      expect(mockUploadService.uploadFileWithToken).toHaveBeenCalledWith(
        mockFile,
        'valid-token',
        'images/',
      );
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        controller.uploadFile(undefined as any, {
          token: 'valid-token',
          folderPath: '',
          file: undefined as any,
        }),
      ).rejects.toThrow('No file provided');
    });

    it('should throw BadRequestException when no token provided', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        controller.uploadFile(mockFile, {
          token: '',
          folderPath: '',
          file: mockFile,
        }),
      ).rejects.toThrow('Upload token is required');
    });
  });
});