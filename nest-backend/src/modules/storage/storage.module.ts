import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AWSStorageProvider } from './providers/aws-storage.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { UserStorageConfig, UserStorageConfigSchema } from '@/schemas/user-storage-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserStorageConfig.name, schema: UserStorageConfigSchema },
    ]),
  ],
  controllers: [StorageController],
  providers: [StorageService, AWSStorageProvider],
  exports: [StorageService],
})
export class StorageModule { }