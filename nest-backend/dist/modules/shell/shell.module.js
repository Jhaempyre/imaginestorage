"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellModule = void 0;
const common_1 = require("@nestjs/common");
const users_module_1 = require("../users/users.module");
const shell_service_1 = require("./shell.service");
const auth_module_1 = require("../auth/auth.module");
const files_module_1 = require("../files/files.module");
const storage_module_1 = require("../storage/storage.module");
const onboarding_module_1 = require("../onboarding/onboarding.module");
let ShellModule = class ShellModule {
};
exports.ShellModule = ShellModule;
exports.ShellModule = ShellModule = __decorate([
    (0, common_1.Module)({
        providers: [shell_service_1.ShellService],
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            files_module_1.FilesModule,
            storage_module_1.StorageModule,
            onboarding_module_1.OnboardingModule,
        ]
    })
], ShellModule);
//# sourceMappingURL=shell.module.js.map