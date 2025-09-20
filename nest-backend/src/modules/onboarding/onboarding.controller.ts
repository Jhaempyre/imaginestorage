import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiBody
} from '@nestjs/swagger';
import { Request } from 'express';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChooseProviderDto } from './dto/choose-provider.dto';
import { ConfigureCredentialsDto } from './dto/configure-credentials.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { EmailVerifiedGuard } from '@/common/guards/email-verified.guard';
import { ERROR_CODES } from '@/common/constants/error-code.constansts';
import { AppException } from '@/common/dto/app-exception';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@ApiBearerAuth('JWT-auth')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) { }

  @Get('status')
  @ApiOperation({
    summary: 'Get onboarding status',
    description: 'Retrieve the current onboarding status and next steps for the user'
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    type: ApiResponseDto
  })
  async getOnboardingStatus(@Req() request: Request) {
    const userId = request.user['_id'];
    const data = await this.onboardingService.getOnboardingStatus(userId);

    return ApiResponseDto.success({
      data,
      message: 'Onboarding.getOnboardingStatus.success',
    });
  }

  @Post('choose-provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Choose storage provider (Step 1)',
    description: 'Select a storage provider for the user account'
  })
  @ApiBody({ type: ChooseProviderDto })
  @ApiResponse({
    status: 200,
    description: 'Storage provider selected successfully',
    type: ApiResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid provider or validation error'
  })
  async chooseProvider(
    @Body() chooseProviderDto: ChooseProviderDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const data = await this.onboardingService.chooseProvider(userId, chooseProviderDto);

    return ApiResponseDto.success({
      data,
      message: 'Onboarding.chooseProvider.success',
      navigation: data.navigation,
    });
  }

  @Post('configure-credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configure storage credentials (Step 2)',
    description: 'Configure and validate storage provider credentials'
  })
  @ApiBody({ type: ConfigureCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Storage credentials configured and validated successfully',
    type: ApiResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or validation failed'
  })
  async configureCredentials(
    @Body() configureCredentialsDto: ConfigureCredentialsDto,
    @Req() request: Request,
  ) {
    const userId = request.user['_id'];
    const result = await this.onboardingService.configureCredentials(userId, configureCredentialsDto);

    if (result.success) {
      return ApiResponseDto.success({
        data: result,
        navigation: result.navigation,
        message: 'Onboarding.configureCredentials.success',
      });
    } else {
      throw new AppException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Onboarding.configureCredentials.invalidCredentials',
        userMessage: 'Invalid credentials',
        navigation: result.navigation,
      });
    }
  }
}