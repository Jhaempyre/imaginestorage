import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { StorageService } from '../storage/storage.service';
import { FilesService } from '../files/files.service';
export declare class ShellService implements OnModuleInit {
    private readonly authService;
    private readonly userService;
    private readonly fileService;
    private readonly storageService;
    private readonly onBoardingService;
    constructor(authService: AuthService, userService: UsersService, fileService: FilesService, storageService: StorageService, onBoardingService: OnboardingService);
    onModuleInit(): void;
}
