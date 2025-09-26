import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UploadFileDto {

  @ApiPropertyOptional({
    description:
      "Folder path (will be auto-normalized to start and end with /)",
    example: "/home/images/",
    default: "/",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== "string") return "/";
    let normalized = value.trim();

    if (!normalized.startsWith("/")) {
      normalized = "/" + normalized;
    }

    // Ensure it ends with /
    if (!normalized.endsWith("/")) {
      normalized += "/";
    }

    return normalized;
  })
  folderPath?: string = "/";
}
