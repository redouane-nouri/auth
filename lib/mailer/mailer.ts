import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
/*
  Returns a singleton nodemailer transporter for sending emails.
*/
export function getMailerTransporter() {
  /*
    If the transporter already exists, return it to reuse the same connection
  */
  if (transporter) return transporter;
  /*
    Create a new nodemailer transporter using OAuth2 authentication
  */
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
  /*
    Return the created transporter for sending emails
  */
  return transporter;
}
