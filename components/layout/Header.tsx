"use client";

import { LanguageCode } from "@/utils/enums";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import {
  Blockquote,
  Button,
  Flex,
  IconButton,
  Select,
  Strong,
} from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageCodeToLabel } from "../../utils/constants";
import { ThemeAppearance } from "../../utils/enums";
import { Appearance } from "../../utils/types";

const Header = ({
  appearance,
  setAppearance,
}: {
  appearance: Appearance;
  setAppearance: React.Dispatch<React.SetStateAction<Appearance>>;
}) => {
  /*
    To refresh the page once the user changes the language because next-intl is SSR.
  */
  const router = useRouter();
  /*
    To know which label & href to setup (home or connect/logout)
  */
  const pathName = usePathname();
  /*
    This state holds the locale, it will changes once the page loaded and getting the prefered language by the user from the `NEXT_LOCALE` cookie.
    Default to `en` if the user didn't choose yet or the cookie has invalid language value.
  */
  const [locale, setLocale] = useState<LanguageCode>(LanguageCode.EN);
  /*
    The handler of the select changing event.
    Once the user chooses a languge from the select menu, this handler will be triggered and:
      - Set the user prefered language to `NEXT_LOCALE` cookie.
      - Changes the local state.
      - Refresh the page using next router because next-intl is SSR.
  */
  const handleLanguageValueUpdate = (value: LanguageCode) => {
    setLocale(value);
    Cookies.set("NEXT_LOCALE", value, {
      expires: 365,
      path: "/",
      sameSite: "Lax",
    });
    router.refresh();
  };
  /*
    The handler of event invoked by the user when clicking on theme changer button.
    It changes the apperance state of the theme component and saving the user's preferred appearance.
  */
  const handleThemeAppearanceUpdate = () => {
    const newAppearance =
      appearance === ThemeAppearance.DARK
        ? ThemeAppearance.LIGHT
        : ThemeAppearance.DARK;

    setAppearance(newAppearance);
    /*
      Cookie is used instead of localStorage to enable SSR-based theme selection.
      With localStorage, the theme defaults to light until client-side hydration applies the user's preference, causing a flash of incorrect theme.
      Cookie ensure the server sends the page with the correct theme pre-applied.
    */
    Cookies.set("appearance", newAppearance, {
      expires: 365,
      path: "/",
      sameSite: "Lax",
    });
  };
  /*
    This will be executed the first time the page is loaded to check if there is any valid value of a user perefered language in the `NEXT_LOCALE` cookie, if does not exist or invalid value then default to `en`.
  */
  useEffect(() => {
    let nextLocale = Cookies.get("NEXT_LOCALE") as LanguageCode;

    const languageValue = Object.values(LanguageCode).includes(nextLocale)
      ? nextLocale
      : LanguageCode.EN;

    setLocale(languageValue);
  }, []);
  /*
    Use `header` translations.
  */
  const t = useTranslations("header");

  return (
    <Flex px="3" py="2" justify="between" align="center">
      <Blockquote>
        <Strong>{t("socialAuthentication")}</Strong>
      </Blockquote>
      <Flex gap="2">
        <Link href={`${pathName === "/" ? "/connect" : "/"}`}>
          <Button tabIndex={-1} variant="surface" highContrast>
            {pathName === "/" ? t("connect") : t("home")}
          </Button>
        </Link>
        <Select.Root
          value={locale}
          onValueChange={(value) => {
            handleLanguageValueUpdate(value as LanguageCode);
          }}
        >
          <Select.Trigger />
          <Select.Content position="popper">
            <Select.Group>
              {Object.entries(LanguageCodeToLabel).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <IconButton
          variant="surface"
          onClick={() => {
            handleThemeAppearanceUpdate();
          }}
        >
          {appearance === ThemeAppearance.DARK ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default Header;
