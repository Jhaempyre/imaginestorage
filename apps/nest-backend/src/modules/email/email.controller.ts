import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { EmailTemplates } from "./templates";

@Controller('email')
export class EmailController {

  @Get('verification')
  async verification(@Res({ passthrough: false }) res: Response) {
    const data = { firstName: "John", verificationUrl: "https://test.com", email: "avinash2002a@gmail.com"};
    const html = EmailTemplates.verification(data);
    res.status(200).send(html);
  }
}