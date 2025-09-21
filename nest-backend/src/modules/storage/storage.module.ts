import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AWSStorageProvider } from './providers/aws-storage.provider';
import { GCPStorageProvider } from './providers/gcp-storage.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { UserStorageConfig, UserStorageConfigSchema } from '@/schemas/user-storage-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserStorageConfig.name, schema: UserStorageConfigSchema },
    ]),
    MulterModule.register({
      dest: './../public/temp', // Temporary upload directory
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [StorageController],
  providers: [
    StorageService, 
    AWSStorageProvider, 
    GCPStorageProvider
  ],
  exports: [StorageService],
})
export class StorageModule { }