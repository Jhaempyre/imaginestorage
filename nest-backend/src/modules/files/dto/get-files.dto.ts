import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";

export class GetFilesDto {
  @ApiPropertyOptional({
    description: "Search term for file names",
    example: "document",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by MIME type",
    example: "image/jpeg",
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    enum: ["createdAt", "updatedAt", "originalName", "fileSize"],
    default: "createdAt",
  })
  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "originalName", "fileSize"])
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";

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
  prefix?: string;
}
