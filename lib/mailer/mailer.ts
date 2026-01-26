import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function getMailerTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_SERVER_AUTH_USER,
      clientId: process.env.EMAIL_SERVER_AUTH_CLIENT_ID,
      clientSecret: process.env.EMAIL_SERVER_AUTH_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_SERVER_AUTH_REFRESH_TOKEN,
    },
  });

  return transporter;
}
