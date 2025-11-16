import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsMongoId } from "class-validator";

export class CopyObjectsDto {
  @ApiProperty({
    description: "Array of source object IDs to be copied",
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  sourceIds: string[];

  @ApiProperty({
    description: "Destination folder ID where objects will be moved",
    type: String,
  })
  @IsMongoId()
  destinationFolderId: string;
}
