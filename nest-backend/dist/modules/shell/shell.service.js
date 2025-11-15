"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellService = void 0;
const common_1 = require("@nestjs/common");
const repl = require("repl");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("../auth/auth.service");
const onboarding_service_1 = require("../onboarding/onboarding.service");
const storage_service_1 = require("../storage/storage.service");
const files_service_1 = require("../files/files.service");
let ShellService = class ShellService {
    constructor(authService, userService, fileService, storageService, onBoardingService) {
        this.authService = authService;
        this.userService = userService;
        this.fileService = fileService;
        this.storageService = storageService;
        this.onBoardingService = onBoardingService;
    }
    onModuleInit() {
        if (process.env.NODE_ENV !== 'development')
            return;
        const shell = repl.start({
            prompt: 'nestjs-shell> ',
            useGlobal: false,
        });
        shell.context.userService = this.userService;
        shell.context.authService = this.authService;
        shell.context.fileService = this.fileService;
        shell.context.storageService = this.storageService;
        shell.context.onBoardingService = this.onBoardingService;
        console.log('NestJS REPL shell ready!');
    }
};
exports.ShellService = ShellService;
exports.ShellService = ShellService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        files_service_1.FilesService,
        storage_service_1.StorageService,
        onboarding_service_1.OnboardingService])
], ShellService);
//# sourceMappingURL=shell.service.js.map