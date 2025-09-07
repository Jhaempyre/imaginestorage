import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AWSStorageProvider } from './providers/aws-storage.provider';

@Module({
  controllers: [StorageController],
  providers: [StorageService, AWSStorageProvider],
  exports: [StorageService],
})
export class StorageModule {}