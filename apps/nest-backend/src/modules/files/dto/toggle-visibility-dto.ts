import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsString,
} from "class-validator";

export class ChangeVisibilityDto {
  @ApiProperty({
    description: "ID of the file or folder to toggle visibility",
    example: "64b8f0f2e1d3c2a1b2c3d4e5",
  })
  @IsArray()
  @IsMongoId({ each: true })
  id: string[];

  @ApiProperty({
    description: "",
  })
  @IsBoolean()
  isPublic: boolean;
}
