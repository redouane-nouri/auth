import "@radix-ui/themes/styles.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import ThemeAndHeader from "../components/layout/ThemeAndHeader";
import { LanguageCode, ThemeAppearance } from "../utils/enums";
import { LanguageCodeToDirection } from "../utils/constants";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export async function generateMetadata(): Promise<Metadata> {
  /*
    Get `metadata` translations.
  */
  const t = await getTranslations("metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
    Get the locale from next-intl (ar, en, ru, etc.), which is decided inside the file `../lib/i18n/request.tsx`.
    Its value is one of the `LanguageCode` enums found in `../utils/enums/global.ts`.
  */
  const locale = await getLocale();
  /*
    Get the messages json file from next-intl (ar.json, rn.json, ru.json, etc.), which is decided inside the file `../lib/i18n/request.tsx`.
    The file is one of the messages files in `../messages`.
  */
  const messages = await getMessages();
  /*
    Decide which theme appearance to use.
    Check if the `appearance` cookie is provided and its value is an enum in `ThemeAppearance`. If not then default to 'light' appearance.
  */
  const appearance =
    (await cookies()).get("appearance")?.value === ThemeAppearance.DARK
      ? ThemeAppearance.DARK
      : ThemeAppearance.LIGHT;

  return (
    <html lang={locale} dir={LanguageCodeToDirection[locale as LanguageCode]}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeAndHeader themeAppearance={appearance} initialLocale={locale as LanguageCode}>
            {
              /*
                Change authjs basepath from /api/auth to /api/{version}/auth
              */
            }
            <SessionProvider basePath={process.env.AUTH_BASEPATH}>
              {children}
            </SessionProvider>
          </ThemeAndHeader>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
