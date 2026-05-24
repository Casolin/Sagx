import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 2525,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAILERSEND_SMTP_USER,
    pass: process.env.MAILERSEND_SMTP_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

export const sendEmail = async (to: string, link: string) => {
  try {
    await transporter.verify();

    await transporter.sendMail({
      from: `"SagX Support" <no-reply@test-zkq340e35n3gd796.mlsender.net>`,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial;">
          <h2>Password Reset</h2>
          <p>Click below to reset your password:</p>
          <a href="${link}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;">
            Reset Password
          </a>
        </div>
      `,
    });

    console.log("EMAIL SENT SUCCESS");
  } catch (err) {
    console.error("EMAIL FAILED:", err);
    throw err;
  }
};
