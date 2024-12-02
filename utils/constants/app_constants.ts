import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import {
  language_app_type,
  social_provider_app_type,
} from "../types/app_types";

export const languages_app_constant: readonly language_app_type[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "ru", label: "Русский" },
  { value: "zh", label: "中文" },
] as const;

export const social_providers_app_constant: readonly social_provider_app_type[] =
  [
    { name: "GitHub", icon: FaGithub },
    { name: "Google", icon: FaGoogle },
    { name: "Facebook", icon: FaFacebook },
  ] as const;
