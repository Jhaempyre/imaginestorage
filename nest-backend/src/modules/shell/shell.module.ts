import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { ShellService } from './shell.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FilesModule } from 'src/modules/files/files.module';
import { StorageModule } from 'src/modules/storage/storage.module';
import { OnboardingModule } from 'src/modules/onboarding/onboarding.module';

@Module({
  providers: [ShellService],
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    StorageModule,
    OnboardingModule,
  ]
})
export class ShellModule { }
