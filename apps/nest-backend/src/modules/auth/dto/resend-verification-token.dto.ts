import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendEmailVerificationDto {
  @ApiProperty({
    description: 'The email address to resend the verification link to',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
