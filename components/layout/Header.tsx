"use client";

import { LanguageCode } from "@/utils/enums";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Blockquote, Flex, IconButton, Select, Strong } from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageCodeToLabel } from "../../utils/constants";
import { ThemeAppearance } from "../../utils/enums";
import { Appearance } from "../../utils/types";

const Header = ({
  appearance,
  setAppearance,
  initialLocale,
}: {
  appearance: Appearance;
  setAppearance: React.Dispatch<React.SetStateAction<Appearance>>;
  initialLocale: LanguageCode;
}) => {
  /*
    To refresh the page once the user changes the language because next-intl is SSR.
  */
  const router = useRouter();
  /*
    This state holds the locale, initialized from the `NEXT_LOCALE` cookie value the server already resolved (see `lib/i18n/request.ts`), so the select shows the right language from the first render instead of flashing English until a mount-time effect corrects it.
  */
  const [locale, setLocale] = useState<LanguageCode>(initialLocale);
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
    Use `header` translations.
  */
  const t = useTranslations("header");

  return (
    <Flex px="3" py="2" justify="between" align="center">
      <Blockquote>
        <Strong>{t("authentication")}</Strong>
      </Blockquote>
      <Flex gap="2">
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
