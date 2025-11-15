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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../common/dto/app-exception");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../schemas/user.schema");
const file_schema_1 = require("../../schemas/file.schema");
let UsersService = class UsersService {
    constructor(userModel, fileModel) {
        this.userModel = userModel;
        this.fileModel = fileModel;
    }
    async getAllUsers() {
        return this.userModel.find().select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    }
    async getUserProfile(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password -refreshToken -emailVerificationToken -passwordResetToken');
        if (!user || !user.isActive || user.deletedAt) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Users.getUserProfile.userNotFound',
                userMessage: 'User not found',
                details: 'The requested user profile could not be found.',
            });
        }
        return user;
    }
    async updateUserProfile(userId, updateProfileDto) {
        const { firstName, lastName, username } = updateProfileDto;
        if (username) {
            const existingUser = await this.userModel.findOne({
                username,
                _id: { $ne: userId },
            });
            if (existingUser) {
                throw new app_exception_1.AppException({
                    statusCode: common_1.HttpStatus.CONFLICT,
                    code: error_code_constansts_1.ERROR_CODES.USERNAME_ALREADY_EXISTS,
                    message: 'Users.updateUserProfile.usernameExists',
                    userMessage: 'Username already exists',
                    details: 'Please choose a different username.',
                    suggestions: ['Try adding numbers or characters to make it unique'],
                });
            }
        }
        const user = await this.userModel.findByIdAndUpdate(userId, {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(username && { username }),
        }, { new: true, runValidators: true }).select('-password -refreshToken -emailVerificationToken -passwordResetToken');
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Users.updateUserProfile.userNotFound',
                userMessage: 'User not found',
            });
        }
        return user;
    }
    async updateUserAvatar(userId, avatarUrl) {
        const user = await this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true }).select('-password -refreshToken -emailVerificationToken -passwordResetToken');
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Users.updateUserProfile.userNotFound',
                userMessage: 'User not found',
                details: 'The requested user could not be found.',
            });
        }
        return user;
    }
    async deleteUserAccount(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Users.deleteUserAccount.userNotFound',
                userMessage: 'User not found',
                details: 'The requested user account could not be found.',
            });
        }
        user.deletedAt = new Date();
        user.isActive = false;
        user.refreshToken = null;
        await user.save();
        await this.fileModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId), deletedAt: null }, { deletedAt: new Date() });
    }
    async getUserStats(userId) {
        const [user, fileStats] = await Promise.all([
            this.userModel.findById(userId).select('createdAt lastLoginAt'),
            this.fileModel.aggregate([
                {
                    $match: {
                        userId: new mongoose_2.Types.ObjectId(userId),
                        deletedAt: null,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalFiles: { $sum: 1 },
                        totalSize: { $sum: '$fileSize' },
                        publicFiles: {
                            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] },
                        },
                        privateFiles: {
                            $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] },
                        },
                    },
                },
            ]),
        ]);
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Users.getUserStats.userNotFound',
                userMessage: 'User not found',
                details: 'The requested user could not be found.',
            });
        }
        const stats = fileStats[0] || {
            totalFiles: 0,
            totalSize: 0,
            publicFiles: 0,
            privateFiles: 0,
        };
        const fileTypeStats = await this.fileModel.aggregate([
            {
                $match: {
                    userId: new mongoose_2.Types.ObjectId(userId),
                    deletedAt: null,
                },
            },
            {
                $group: {
                    _id: '$mimeType',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        const recentUploads = await this.fileModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            deletedAt: null,
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('originalName fileSize mimeType createdAt');
        return {
            user: {
                joinedAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            },
            files: {
                ...stats,
                typeBreakdown: fileTypeStats,
                recent: recentUploads,
            },
        };
    }
    async getUserFiles(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [files, totalFiles] = await Promise.all([
            this.fileModel
                .find({
                userId: new mongoose_2.Types.ObjectId(userId),
                deletedAt: null,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v'),
            this.fileModel.countDocuments({
                userId: new mongoose_2.Types.ObjectId(userId),
                deletedAt: null,
            }),
        ]);
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalFiles / limit),
            totalItems: totalFiles,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(totalFiles / limit),
            hasPrevPage: page > 1,
        };
        return { files, pagination };
    }
    async searchUsers(searchTerm, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const searchQuery = {
            $or: [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
            isActive: true,
            deletedAt: null,
        };
        const [users, totalUsers] = await Promise.all([
            this.userModel
                .find(searchQuery)
                .select('firstName lastName username email avatar createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.userModel.countDocuments(searchQuery),
        ]);
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalItems: totalUsers,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(totalUsers / limit),
            hasPrevPage: page > 1,
        };
        return { users, pagination };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(file_schema_1.File.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map