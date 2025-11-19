import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsMongoId, IsOptional, IsString } from "class-validator";

export class MoveObjectsDto {
  @ApiProperty({
    description: "Array of source object IDs to be moved",
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  sourceIds: string[];

  @ApiProperty({
    description: "Destination folder ID where objects will be moved. Use 'root' for root directory.",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationFolderId?: string;

  @ApiProperty({
    description: "Destination folder path. Use when moving to root or specific path.",
    type: String,
    required: false,
    default: "/",
  })
  @IsOptional()
  @IsString()
  destinationPath?: string;
}
