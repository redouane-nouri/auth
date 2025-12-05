import { LanguageCode } from "@/utils/enums/global";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  /*
    Getting the value of the NEXT_LOCAL cookie which we are using to store the user's prefered language.
  */
  let nextLocale = (await cookies()).get("NEXT_LOCALE")
    ?.value as LanguageCode;
  /*
    Whitelisting:
    Ensuring the value of the language cookie is one of the language values we support (prevent injection).
    Default to english if the value provided not included in `LanguageCode`.
  */
  const locale = Object.values(LanguageCode).includes(nextLocale)
    ? nextLocale
    : LanguageCode.EN;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
