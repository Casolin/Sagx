import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, link: string) => {
  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Password Reset</h2>
          <p>You requested to reset your password.</p>
          <p>Click the button below to reset it:</p>

          <a href="${link}" 
             style="
              display:inline-block;
              padding:10px 20px;
              background:#4f46e5;
              color:#fff;
              text-decoration:none;
              border-radius:5px;
              margin-top:10px;
             ">
            Reset Password
          </a>

          <p style="margin-top:20px; font-size:12px; color:#666;">
            This link will expire in 30 minutes.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};
