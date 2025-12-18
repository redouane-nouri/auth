import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import { LanguageLabel, SocialProviderLabel } from "./enums";
import { LanguageCode } from "./enums";
import { SocialProvider } from "./types";

export const AUTH_LOGIN_EMAIL_SUBJECT = "Signin Link";
export const AUTH_NODEMAILER_OAUTH2_TYPE = "OAuth2";
export const AUTH_SIGNIN_ENDPOINT = "/connect";
export const AUTH_ERROR_ENDPOINT = "/not-found";
export const AUTH_VERIFY_REQUEST_ENDPOINT = "/connect";
export const AUTH_SIGNOUT_ENDPOINT = "/";
export const AUTH_NEW_USER_ENDPOINT = "/";
export const AUTH_CREDENTIALS_PROVIDER_NAME = "credentials";

export const LanguageCodeToLabel: Record<LanguageCode, LanguageLabel> = {
  [LanguageCode.AR]: LanguageLabel.AR,
  [LanguageCode.EN]: LanguageLabel.EN,
  [LanguageCode.ES]: LanguageLabel.ES,
  [LanguageCode.RU]: LanguageLabel.RU,
  [LanguageCode.ZH]: LanguageLabel.ZH,
} as const;

export const socialProviders: readonly SocialProvider[] = [
  { label: SocialProviderLabel.GITHUB, icon: FaGithub },
  { label: SocialProviderLabel.GOOGLE, icon: FaGoogle },
  { label: SocialProviderLabel.FACEBOOK, icon: FaFacebook },
] as const;
