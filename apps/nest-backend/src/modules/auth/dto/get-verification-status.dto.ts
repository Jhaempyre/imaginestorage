import { IsNotEmpty, IsString } from "class-validator";

export class GetVerificationStatusDto {

  @IsString()
  @IsNotEmpty()
  email: string;
}