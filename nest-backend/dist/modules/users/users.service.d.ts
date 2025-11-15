import { Model } from 'mongoose';
import { UserDocument } from '../../schemas/user.schema';
import { FileDocument } from '../../schemas/file.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private userModel;
    private fileModel;
    constructor(userModel: Model<UserDocument>, fileModel: Model<FileDocument>);
    getAllUsers(): Promise<UserDocument[]>;
    getUserProfile(userId: string): Promise<UserDocument>;
    updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument>;
    updateUserAvatar(userId: string, avatarUrl: string): Promise<UserDocument>;
    deleteUserAccount(userId: string): Promise<void>;
    getUserStats(userId: string): Promise<any>;
    getUserFiles(userId: string, page?: number, limit?: number): Promise<{
        files: FileDocument[];
        pagination: PaginationResponseDto;
    }>;
    searchUsers(searchTerm: string, page?: number, limit?: number): Promise<{
        users: UserDocument[];
        pagination: PaginationResponseDto;
    }>;
}
