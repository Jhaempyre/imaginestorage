import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RenameDto {
  @ApiProperty({
    description: "ID of the file or folder to rename",
    example: "64b8f0f2e1d3c2a1b2c3d4e5",
  })
  @IsMongoId()
  id: string;

  @ApiProperty({
    description: "New name for the file or folder",
    example: "new_filename.txt",
    name: "New Name",
    maxLength: 255,
    required: true,

  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  newName: string;
}
