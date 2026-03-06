import nodemailer from "nodemailer";

export const sendEmail = async (
  from: string,
  to: string,
  subject: string,
  html: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};
