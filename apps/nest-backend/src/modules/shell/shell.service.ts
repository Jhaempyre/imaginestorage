import { Injectable, OnModuleInit } from '@nestjs/common';
import * as repl from 'repl';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { StorageService } from '../storage/storage.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class ShellService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService, // any service you want
    private readonly userService: UsersService, // any service you want
    private readonly fileService: FilesService,
    private readonly storageService: StorageService,
    private readonly onBoardingService: OnboardingService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    const shell = repl.start({
      prompt: 'nestjs-shell> ',
      useGlobal: false,
    });

    // Expose services in the REPL
    shell.context.userService = this.userService;
    shell.context.authService = this.authService;
    shell.context.fileService = this.fileService;
    shell.context.storageService = this.storageService;
    shell.context.onBoardingService = this.onBoardingService;

    console.log('NestJS REPL shell ready!');
  }
}
