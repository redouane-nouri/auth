import { LanguageCode } from "@/utils/enums/global";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  /*
    Getting the value of the NEXT_LOCAL cookie which we are using to store the user's prefered language.
  */
  let next_locale = (await cookies()).get("NEXT_LOCALE")
    ?.value as LanguageCode;
  /*
    Whitelisting:
    Ensuring the value of the language cookie is one of the languages values we suport (prevent injection).
    Default to english if the value provided not included in `language_values_app_enum`.
  */
  const locale = Object.values(LanguageCode).includes(
    next_locale,
  )
    ? next_locale
    : LanguageCode.EN;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
