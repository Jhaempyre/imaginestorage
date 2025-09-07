import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { File, FileDocument } from '../../schemas/file.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {}

  async getUserProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user || !user.isActive || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
    const { firstName, lastName, username } = updateProfileDto;

    // Check if username is already taken (if provided)
    if (username) {
      const existingUser = await this.userModel.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUserAccount(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete user
    user.deletedAt = new Date();
    user.isActive = false;
    user.refreshToken = null;
    await user.save();

    // Soft delete all user files
    await this.fileModel.updateMany(
      { userId: new Types.ObjectId(userId), deletedAt: null },
      { deletedAt: new Date() }
    );
  }

  async getUserStats(userId: string): Promise<any> {
    const [user, fileStats] = await Promise.all([
      this.userModel.findById(userId).select('createdAt lastLoginAt'),
      this.fileModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
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
      throw new NotFoundException('User not found');
    }

    const stats = fileStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      publicFiles: 0,
      privateFiles: 0,
    };

    // Get file type breakdown
    const fileTypeStats = await this.fileModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
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

    // Get recent uploads
    const recentUploads = await this.fileModel
      .find({
        userId: new Types.ObjectId(userId),
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

  async getUserFiles(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ files: FileDocument[]; pagination: PaginationResponseDto }> {
    const skip = (page - 1) * limit;

    const [files, totalFiles] = await Promise.all([
      this.fileModel
        .find({
          userId: new Types.ObjectId(userId),
          deletedAt: null,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      this.fileModel.countDocuments({
        userId: new Types.ObjectId(userId),
        deletedAt: null,
      }),
    ]);

    const pagination: PaginationResponseDto = {
      currentPage: page,
      totalPages: Math.ceil(totalFiles / limit),
      totalItems: totalFiles,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalFiles / limit),
      hasPrevPage: page > 1,
    };

    return { files, pagination };
  }

  async searchUsers(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: UserDocument[]; pagination: PaginationResponseDto }> {
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

    const pagination: PaginationResponseDto = {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalItems: totalUsers,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalUsers / limit),
      hasPrevPage: page > 1,
    };

    return { users, pagination };
  }
}