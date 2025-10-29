import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { STORAGE_PROVIDERS, StorageProvider } from '../../../common/constants/storage.constants';

export class ChooseProviderDto {
  @ApiProperty({
    description: 'Storage provider to use',
    enum: Object.values(STORAGE_PROVIDERS),
    example: STORAGE_PROVIDERS.AWS,
  })
  @IsNotEmpty({ message: 'Provider is required' })
  @IsEnum(STORAGE_PROVIDERS, { 
    message: `Provider must be one of: ${Object.values(STORAGE_PROVIDERS).join(', ')}` 
  })
  provider: StorageProvider;
}