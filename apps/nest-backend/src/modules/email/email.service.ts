import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { EmailTemplates } from "./templates";
import { EnvironmentVariables } from "@/common/utils/validate-env";

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;
  private readonly logger: Logger;
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.logger = new Logger("EmailService");
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      // secure: true,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, verificationUrl: string, firstName?: string) {
    const msg = {
      from: this.configService.get('EMAIL_PASS'),
      to: email,
      subject: 'Verify your email',
      html: EmailTemplates.verification({ email, verificationUrl, firstName: firstName ?? 'User' }),
    };

    try {
      const info = await this.transporter.sendMail(msg);
      this.logger.log(`✉️  Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('❌ Email sending failed', error.stack);
    }
  }
}