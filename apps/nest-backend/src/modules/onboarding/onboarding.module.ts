import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserStorageConfig, UserStorageConfigSchema } from '../../schemas/user-storage-config.schema';
import { NavigationService } from '../../common/services/navigation.service';
import { EncryptionService } from '@/common/services/encription.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserStorageConfig.name, schema: UserStorageConfigSchema },
    ]),
    StorageModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, NavigationService, EncryptionService],
  exports: [OnboardingService],
})
export class OnboardingModule {}