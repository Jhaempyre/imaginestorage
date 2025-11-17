import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsMongoId, IsOptional } from "class-validator";

export class CreateSharingUrlDto {
  @ApiProperty({ description: "ID of the file to share" })
  @IsMongoId()
  fileId: string;

  @ApiProperty({
    description: "Expiration date of the sharing URL",
    required: false,
  })
  @IsDate()
  @IsOptional()
  expiresAt?: Date | null;

  @ApiProperty({
    description: "Expiration duration in seconds from now",
    required: false,
  })
  @IsOptional()
  durationSeconds?: number | null;
}
