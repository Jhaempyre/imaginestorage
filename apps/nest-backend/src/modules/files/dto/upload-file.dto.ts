import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { sanitizePath } from "../utils/santize-path";

export class UploadFileDto {
  @ApiPropertyOptional({
    description:
      "Folder path, should not start with /, to show root just send empty string, and for some finite folder it should end with a /",
    example: "home/images/",
    default: "",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizePath(value))
  folderPath?: string;
}
