import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILERSEND_SMTP_USER,
    pass: process.env.MAILERSEND_SMTP_PASS,
  },
});

console.log("SMTP USER:", process.env.MAILERSEND_SMTP_USER);
console.log("SMTP PASS exists:", !!process.env.MAILERSEND_SMTP_PASS);

export const sendEmail = async (to: string, link: string) => {
  try {
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
