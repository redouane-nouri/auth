import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import {
  LanguageLabel,
  SocialProviderLabel,
} from "../enums/app";
import { LanguageCode } from "../enums/global";
import { SocialProvider } from "../types/app";

export const LanguageCodeToLabel: Record<
  LanguageCode,
  LanguageLabel
> = {
  [LanguageCode.AR]: LanguageLabel.AR,
  [LanguageCode.EN]: LanguageLabel.EN,
  [LanguageCode.ES]: LanguageLabel.ES,
  [LanguageCode.RU]: LanguageLabel.RU,
  [LanguageCode.ZH]: LanguageLabel.ZH,
} as const;

export const socialProviders: readonly SocialProvider[] =
  [
    { label: SocialProviderLabel.GITHUB, icon: FaGithub },
    { label: SocialProviderLabel.GOOGLE, icon: FaGoogle },
    { label: SocialProviderLabel.FACEBOOK, icon: FaFacebook },
  ] as const;
