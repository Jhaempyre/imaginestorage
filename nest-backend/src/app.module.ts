import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { StorageModule } from './modules/storage/storage.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ShellModule } from './modules/shell/shell.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database connection
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginary-storage',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    
    // Feature modules
    AuthModule,
    UsersModule,
    FilesModule,
    StorageModule,
    OnboardingModule,
    ShellModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}