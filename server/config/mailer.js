import { Resend } from "resend";

/**
 * Sends login credentials to a newly created supervisor via Resend HTTP API.
 * No SMTP ports involved — works on any host including Render free tier.
 *
 * Setup: create a free account at https://resend.com, get your API key,
 * and add RESEND_API_KEY to your environment variables.
 */
export const sendSupervisorCredentials = async (toEmail, name, password) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY environment variable is not set");

  const resend = new Resend(apiKey);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
          .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: #1a2a8f; padding: 32px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
          .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 36px 40px; }
          .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .cred-box { background: #f0f4ff; border: 1px solid #d0d9ff; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
          .cred-row { margin-bottom: 14px; }
          .cred-row:last-child { margin-bottom: 0; }
          .cred-label { color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
          .cred-value { font-family: 'Courier New', monospace; color: #1a2a8f; font-size: 15px; font-weight: 700; background: #ffffff; border: 1px solid #d0d9ff; border-radius: 5px; padding: 6px 12px; display: inline-block; }
          .note { background: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin-top: 20px; }
          .note p { color: #92400e; font-size: 13px; margin: 0; }
          .footer { background: #f4f6f8; padding: 20px 40px; text-align: center; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>CSS FYP System</h1>
            <p>Computer Science Department — Final Year Project Platform</p>
          </div>
          <div class="body">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your supervisor account has been created on the <strong>CSS FYP Project Supervision System</strong>. Use the credentials below to log in:</p>
            <div class="cred-box">
              <div class="cred-row">
                <span class="cred-label">Email</span>
                <span class="cred-value">${toEmail}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Password</span>
                <span class="cred-value">${password}</span>
              </div>
            </div>
            <p>You can log in at the system URL provided by your administrator.</p>
            <div class="note">
              <p>⚠️ For security, please change your password after your first login via <strong>Settings → Change Password</strong>.</p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "CSS FYP System <onboarding@resend.dev>",
    to: toEmail,
    subject: "Your CSS FYP Supervisor Account Credentials",
    html,
  });

  if (error) throw new Error(error.message);
};
