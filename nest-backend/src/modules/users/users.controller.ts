import { 
  Controller, 
  Get, 
  Put, 
  Delete,
  Body, 
  Query,
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Req() request: Request) {
    const userId = request.user['_id'];
    const user = await this.usersService.getUserProfile(userId);

    return ApiResponseDto.success({
      message: 'Users.getUserProfile.success',
      data: { user },
    });
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async updateUserProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const user = await this.usersService.updateUserProfile(userId, updateProfileDto);

    return ApiResponseDto.success({
      message: 'Users.updateUserProfile.success',
      data: { user },
    });
  }

  @Put('avatar')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 200, description: 'User avatar updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserAvatar(
    @Body('avatar') avatarUrl: string,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const user = await this.usersService.updateUserAvatar(userId, avatarUrl);

    return ApiResponseDto.success({
      message: 'Users.updateUserAvatar.success',
      data: { user },
    });
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account (soft delete)' })
  @ApiResponse({ status: 200, description: 'User account deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUserAccount(@Req() request: Request) {
    const userId = request.user['_id'];
    await this.usersService.deleteUserAccount(userId);

    return ApiResponseDto.success({
      message: 'Users.deleteUserAccount.success',
      data: null,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics and analytics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(@Req() request: Request) {
    const userId = request.user['_id'];
    const stats = await this.usersService.getUserStats(userId);

    return ApiResponseDto.success({
      message: 'Users.getUserStats.success',
      data: stats,
    });
  }

  @Get('files')
  @ApiOperation({ summary: 'Get user files with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'User files retrieved successfully' })
  async getUserFiles(
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.usersService.getUserFiles(userId, page, limit);

    return ApiResponseDto.success({
      message: 'Users.getUserFiles.success',
      data: {
        files: result.files,
        pagination: result.pagination,
      },
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users (Admin functionality)' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Users search completed successfully' })
  async searchUsers(
    @Query('q') searchTerm: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.usersService.searchUsers(searchTerm, page, limit);

    return ApiResponseDto.success({
      message: 'Users.searchUsers.success',
      data: {
        users: result.users,
        pagination: result.pagination,
      },
    });
  }
}