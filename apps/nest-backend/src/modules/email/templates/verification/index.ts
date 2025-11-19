export const verificationTemplate = (data: {
  firstName: string;
  verificationUrl: string;
  brandName: string;
  address?: string;
  links?: { label: string; url: string }[];
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: hsl(210, 40%, 96.1%); line-height: 1.6;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: hsl(210, 40%, 96.1%);">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: hsl(0, 0%, 100%); border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: hsl(222.2, 47.4%, 11.2%); color: hsl(210, 40%, 98%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Verify Your Email Address</h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 15px;">Complete your registration</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px; color: hsl(222.2, 84%, 4.9%);">
                            <p style="margin: 0 0 20px 0; font-size: 15px;">Hi <strong>${data.firstName}</strong>,</p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 15px;">Thank you for signing up! To complete your registration and start using your account, please verify your email address by clicking the button below.</p>

                            <!-- Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${data.verificationUrl}" style="display: inline-block; background-color: hsl(222.2, 47.4%, 11.2%); color: hsl(210, 40%, 98%); padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="height: 1px; background-color: hsl(214.3, 31.8%, 91.4%);"></td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; text-align: center; color: hsl(215.4, 16.3%, 46.9%); font-size: 14px;">
                                If the button above doesn't work, copy and paste this link into your browser:
                            </p>

                            <!-- Link Box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background-color: hsl(210, 40%, 96.1%); border: 1px solid hsl(214.3, 31.8%, 91.4%); border-radius: 6px; padding: 20px; text-align: center;">
                                        <div style="color: hsl(215.4, 16.3%, 46.9%); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Verification Link</div>
                                        <div style="font-size: 13px; color: hsl(222.2, 47.4%, 11.2%); word-break: break-all; font-family: monospace;">
                                            ${data.verificationUrl}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info Box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0;">
                                <tr>
                                    <td style="background-color: hsl(210, 40%, 96.1%); border-left: 3px solid hsl(222.2, 47.4%, 11.2%); padding: 16px; border-radius: 4px;">
                                        <p style="margin: 0; font-size: 14px; color: hsl(222.2, 47.4%, 11.2%);">
                                            <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-size: 15px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>

                            <p style="margin: 30px 0 0 0; font-size: 15px;">
                                Best regards,<br>
                                <strong>${data?.brandName ?? ""}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: hsl(210, 40%, 96.1%); padding: 30px; text-align: center; color: hsl(215.4, 16.3%, 46.9%); font-size: 13px;">
                            ${data?.brandName ? `<p style="margin: 0 0 10px 0;">© 2024 ${data.brandName}. All rights reserved.</p>` : ""}
                            ${
                              data?.links && data.links.length > 0
                                ? `<p style="margin: 0 0 10px 0;">
                                    ${data.links
                                      .map(
                                        (link) =>
                                          `<a href="${link.url}" style="color: hsl(222.2, 47.4%, 11.2%); text-decoration: none;">${link.label}</a>`
                                      )
                                      .join(' · ')}
                                  </p>`
                                : ""
                            }
                            ${data?.address ? `<p style="margin: 15px 0 0 0;">${data.address}</p>` : ""}
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};