import { IconType } from "react-icons/lib";

export type OAuth2ProviderT = {
  id: string;
  label: string;
  icon: IconType;
};

export type Appearance = "dark" | "light";
