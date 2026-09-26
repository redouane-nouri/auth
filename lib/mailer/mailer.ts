import nodemailer, { Transporter } from "nodemailer";
import {
  getEmailServerAuthClientIdFromEnv,
  getEmailServerAuthClientSecretFromEnv,
  getEmailServerAuthRefreshTokenFromEnv,
  getEmailServerAuthUserFromEnv,
  getEmailServerHostFromEnv,
  getEmailServerPortFromEnv,
  getEmailServerSecureFromEnv,
} from "@/utils/functions";
import { AUTH_NODEMAILER_OAUTH2_TYPE } from "@/utils/constants";

let transporter: Transporter | null = null;
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
    host: getEmailServerHostFromEnv(),
    port: getEmailServerPortFromEnv(),
    secure: getEmailServerSecureFromEnv(),
    auth: {
      type: AUTH_NODEMAILER_OAUTH2_TYPE,
      user: getEmailServerAuthUserFromEnv(),
      clientId: getEmailServerAuthClientIdFromEnv(),
      clientSecret: getEmailServerAuthClientSecretFromEnv(),
      refreshToken: getEmailServerAuthRefreshTokenFromEnv(),
    },
  });
  /*
    Return the created transporter for sending emails
  */
  return transporter;
}
