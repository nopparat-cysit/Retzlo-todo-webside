import nodemailer from "nodemailer";

interface SendPasswordResetOtpInput {
  email: string;
  otp: string;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

export async function sendPasswordResetOtp({ email, otp }: SendPasswordResetOtpInput) {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error("SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Retzlo password reset OTP",
    text: `Your Retzlo password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Retzlo password reset</h2>
        <p>Your OTP is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `
  });
}

export interface SendProjectInvitationEmailInput {
  email: string;
  inviterName: string;
  projectName: string;
  acceptUrl: string;
}

export async function sendProjectInvitationEmail({
  email,
  inviterName,
  projectName,
  acceptUrl
}: SendProjectInvitationEmailInput) {
  const config = getSmtpConfig();

  if (!config) {
    console.warn(
      `[MAIL] SMTP not configured. Project invitation email for ${email} to join "${projectName}": ${acceptUrl}`
    );
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" as const };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: `คุณได้รับคำเชิญเข้าร่วมโปรเจกต์ "${projectName}" บน Retzlo`,
    text: `${inviterName} ได้เชิญคุณเข้าร่วมโปรเจกต์ "${projectName}" บน Retzlo เข้าสู่ระบบและกดรับคำเชิญได้ที่: ${acceptUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>คำเชิญเข้าร่วมโปรเจกต์</title>
        </head>
        <body style="margin:0;padding:0;background-color:#0e0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f5f5f4;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0e0f17;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#161826;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
                  <tr>
                    <td style="padding:32px 32px 20px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#e5bd72;text-transform:uppercase;">RETZLO WORKSPACE</p>
                      <h1 style="margin:8px 0 0 0;font-size:24px;font-weight:700;color:#ffffff;">คำเชิญเข้าร่วมโปรเจกต์</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d6d3d1;">
                        สวัสดีครับ,<br><br>
                        <strong style="color:#a9a2ff;">${inviterName}</strong> ได้เชิญคุณเข้าร่วมทำงานในโปรเจกต์:
                      </p>
                      <div style="background-color:rgba(169,162,255,0.08);border:1px solid rgba(169,162,255,0.25);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                        <span style="font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;">ชื่อโปรเจกต์ (Project)</span>
                        <span style="font-size:18px;font-weight:700;color:#ffffff;">${projectName}</span>
                      </div>
                      <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px auto;">
                        <tr>
                          <td align="center" style="border-radius:10px;background:linear-gradient(135deg,#7364ff,#a9a2ff);">
                            <a href="${acceptUrl}" target="_blank" style="font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 32px;display:inline-block;border-radius:10px;letter-spacing:0.02em;">
                              👉 คลิกเพื่อเข้าร่วมโปรเจกต์ (Accept Invitation)
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:12px;line-height:1.5;color:#78716c;text-align:center;">
                        ลิงก์คำเชิญนี้มีอายุ 7 วัน หากปุ่มด้านบนไม่ทำงาน สามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้:<br>
                        <a href="${acceptUrl}" style="color:#a9a2ff;word-break:break-all;font-size:11px;">${acceptUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });

  return { sent: true };
}
