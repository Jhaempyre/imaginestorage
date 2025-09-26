import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UploadFileDto {

  @ApiPropertyOptional({
    description:
      "Folder path, should not start with /, to show root just send empty string, and for some finite folder it should end with a /",
    example: "home/images/",
    default: "",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== "string") return "";
    let normalized = value.trim();

    if (normalized === "/") return "";

    // Ensure it only starts with / if its /
    if (normalized.startsWith("/") && normalized !== "/") {
      normalized = normalized.slice(1);
    }

    // Ensure it ends with /
    if (!normalized.endsWith("/")) {
      normalized += "/";
    }

    return normalized;
  })
  folderPath?: string;
}
