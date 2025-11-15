import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUserProfile(request: Request): Promise<ApiResponseDto<{
        user: import("../../schemas/user.schema").UserDocument;
    }>>;
    updateUserProfile(updateProfileDto: UpdateProfileDto, request: Request): Promise<ApiResponseDto<{
        user: import("../../schemas/user.schema").UserDocument;
    }>>;
    updateUserAvatar(avatarUrl: string, request: Request): Promise<ApiResponseDto<{
        user: import("../../schemas/user.schema").UserDocument;
    }>>;
    deleteUserAccount(request: Request): Promise<ApiResponseDto<any>>;
    getUserStats(request: Request): Promise<ApiResponseDto<any>>;
    getUserFiles(paginationDto: PaginationDto, request: Request): Promise<ApiResponseDto<{
        files: import("../../schemas/file.schema").FileDocument[];
        pagination: import("../../common/dto/pagination.dto").PaginationResponseDto;
    }>>;
    searchUsers(searchTerm: string, paginationDto: PaginationDto): Promise<ApiResponseDto<{
        users: import("../../schemas/user.schema").UserDocument[];
        pagination: import("../../common/dto/pagination.dto").PaginationResponseDto;
    }>>;
}
