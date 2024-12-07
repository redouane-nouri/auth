import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { language_values_app_enum } from "../../utils/enums/app_enums";

export default getRequestConfig(async () => {
  /*
    Getting the value of the NEXT_LOCAL cookie which we are using to store the user's prefered language.
  */
  let next_locale = (await cookies()).get("NEXT_LOCALE")
    ?.value as language_values_app_enum;
  /*
    Whitelisting:
    Ensuring the value of the language cookie is one of the languages values we suport (prevent injection).
    Default to english if the value provided not included in `language_values_app_enum`.
  */
  const locale = Object.values(language_values_app_enum).includes(next_locale)
    ? next_locale
    : language_values_app_enum.EN;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
