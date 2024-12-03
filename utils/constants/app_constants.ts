import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";
import {
  language_labels_app_enum,
  language_values_app_enum,
  social_providers_labels_app_enum,
} from "../enums/app_enums";
import { social_provider_app_type } from "../types/app_types";

export const map_value_to_label_app_constant: Record<
  language_values_app_enum,
  language_labels_app_enum
> = {
  [language_values_app_enum.AR]: language_labels_app_enum.AR,
  [language_values_app_enum.EN]: language_labels_app_enum.EN,
  [language_values_app_enum.ES]: language_labels_app_enum.ES,
  [language_values_app_enum.RU]: language_labels_app_enum.RU,
  [language_values_app_enum.ZH]: language_labels_app_enum.ZH,
} as const;

export const social_providers_app_constant: readonly social_provider_app_type[] =
  [
    { label: social_providers_labels_app_enum.GITHUB, icon: FaGithub },
    { label: social_providers_labels_app_enum.GOOGLE, icon: FaGoogle },
    { label: social_providers_labels_app_enum.FACEBOOK, icon: FaFacebook },
  ] as const;
