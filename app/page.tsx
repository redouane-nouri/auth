import { useTranslations } from "next-intl";

export default function HomePage() {
  /*
    Use `home` translations.
  */
  const t = useTranslations("home");
  return <div>{t("home")}</div>;
}
