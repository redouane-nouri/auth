import { IconType } from "react-icons/lib";

export type SocialProvider = {
  id: string;
  label: string;
  icon: IconType;
};

export type Appearance = "dark" | "light";
