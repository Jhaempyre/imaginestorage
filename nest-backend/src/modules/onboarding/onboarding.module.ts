import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserStorageConfig, UserStorageConfigSchema } from '../../schemas/user-storage-config.schema';
import { NavigationService } from '../../common/services/navigation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserStorageConfig.name, schema: UserStorageConfigSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, NavigationService],
  exports: [OnboardingService],
})
export class OnboardingModule {}