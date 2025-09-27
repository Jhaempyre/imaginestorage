import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";
import { sanitizePath } from "../utils/santize-path";

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
  @Transform(({ value }) => sanitizePath(value))
  prefix?: string;
}
