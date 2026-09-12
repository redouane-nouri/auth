import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import {
  LanguageLabel,
  OAuth2ProviderAuthId,
  OAuth2ProviderLabel,
} from "./enums";
import { LanguageCode } from "./enums";
import { OAuth2ProviderT } from "./types";

export const AUTH_LOGIN_EMAIL_SUBJECT = "Signin Link";
export const AUTH_NODEMAILER_OAUTH2_TYPE = "OAuth2";
export const AUTH_SIGNIN_ENDPOINT = "/connect";
export const AUTH_ERROR_ENDPOINT = "/not-found";
export const AUTH_VERIFY_REQUEST_ENDPOINT = "/connect";
export const AUTH_SIGNOUT_ENDPOINT = "/";
export const AUTH_NEW_USER_ENDPOINT = "/";
export const AUTH_CREDENTIALS_PROVIDER_NAME = "credentials";
export const AUTH_NODEMAILER_PROVIDER_NAME = "nodemailer";
export const AUTH_GITHUB_PROVIDER_NAME = "github";

export const LanguageCodeToLabel: Record<LanguageCode, LanguageLabel> = {
  [LanguageCode.AR]: LanguageLabel.AR,
  [LanguageCode.EN]: LanguageLabel.EN,
  [LanguageCode.ES]: LanguageLabel.ES,
  [LanguageCode.RU]: LanguageLabel.RU,
  [LanguageCode.ZH]: LanguageLabel.ZH,
} as const;

/*
  Text direction per language, used to set the `dir` attribute on `<html>` so RTL languages (Arabic)
  render mirrored instead of being forced into a left-to-right layout.
*/
export const LanguageCodeToDirection: Record<LanguageCode, "ltr" | "rtl"> = {
  [LanguageCode.AR]: "rtl",
  [LanguageCode.EN]: "ltr",
  [LanguageCode.ES]: "ltr",
  [LanguageCode.RU]: "ltr",
  [LanguageCode.ZH]: "ltr",
} as const;

export const oAuth2Providers: readonly OAuth2ProviderT[] = [
  {
    id: OAuth2ProviderAuthId.GITHUB,
    label: OAuth2ProviderLabel.GITHUB,
    icon: FaGithub,
  },
  {
    id: OAuth2ProviderAuthId.GOOGLE,
    label: OAuth2ProviderLabel.GOOGLE,
    icon: FaGoogle,
  },
] as const;
