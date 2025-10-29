import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { sanitizePath } from "../utils/santize-path";

export class CreateFolderDto {
  @ApiProperty({ description: "Folder path" })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => sanitizePath(value))
  fullPath: string;
}
