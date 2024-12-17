"use client";

import { language_values_global_enum } from "@/utils/enums/global_enums";
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
import { map_value_to_label_app_constant } from "../../utils/constants/app_constants";
import { theme_appearance_app_enum } from "../../utils/enums/app_enums";
import { theme_appearance_type } from "../../utils/types/app_types";

const Header = ({
  appearance,
  set_appearance,
}: {
  appearance: theme_appearance_type;
  set_appearance: React.Dispatch<React.SetStateAction<theme_appearance_type>>;
}) => {
  /*
    To refresh the page once the user changes the language because next-intl is SSR.
  */
  const router = useRouter();
  /*
    To know which label & href to setup (home or connect/logout)
  */
  const path_name = usePathname();
  /*
    This state holds the locale, it will changes once the page loaded and getting the prefered language by the user from the `NEXT_LOCALE` cookie.
    Default to `en` if the user didn't choose yet or the cookie has invalid language value.
  */
  const [locale, set_locale] = useState<language_values_global_enum>(
    language_values_global_enum.EN
  );
  /*
    The handler of the select changing event.
    Once the user chooses a languge from the select menu, this handler will be triggered and:
      - Set the user prefered language to `NEXT_LOCALE` cookie.
      - Changes the local state.
      - Refresh the page using next router because next-intl is SSR.
  */
  const handle_language_value_update = (value: language_values_global_enum) => {
    set_locale(value);
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
  const handle_theme_appearance_update = () => {
    const new_appearance =
      appearance === theme_appearance_app_enum.DARK
        ? theme_appearance_app_enum.LIGHT
        : theme_appearance_app_enum.DARK;

    set_appearance(new_appearance);
    /*
      Cookie is used instead of localStorage to enable SSR-based theme selection.
      With localStorage, the theme defaults to light until client-side hydration applies the user's preference, causing a flash of incorrect theme.
      Cookie ensure the server sends the page with the correct theme pre-applied.
    */
    Cookies.set("appearance", new_appearance, {
      expires: 365,
      path: "/",
      sameSite: "Lax",
    });
  };
  /*
    This will be executed the first time the page is loaded to check if there is any valid value of a user perefered language in the `NEXT_LOCALE` cookie, if does not exist or invalid value then default to `en`.
  */
  useEffect(() => {
    let next_locale = Cookies.get("NEXT_LOCALE") as language_values_global_enum;

    const language_value = Object.values(language_values_global_enum).includes(
      next_locale
    )
      ? next_locale
      : language_values_global_enum.EN;

    set_locale(language_value);
  }, []);
  /*
    Use `header` translations.
  */
  const t = useTranslations("header");

  return (
    <Flex px="3" py="2" justify="between" align="center">
      <Blockquote>
        <Strong>{t("social_authentication")}</Strong>
      </Blockquote>
      <Flex gap="2">
        <Link href={`${path_name === "/" ? "/connect" : "/"}`}>
          <Button variant="surface" highContrast>
            {path_name === "/" ? t("connect") : t("home")}
          </Button>
        </Link>
        <Select.Root
          value={locale}
          onValueChange={(value) => {
            handle_language_value_update(value as language_values_global_enum);
          }}
        >
          <Select.Trigger />
          <Select.Content position="popper">
            <Select.Group>
              {Object.entries(map_value_to_label_app_constant).map(
                ([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                )
              )}
            </Select.Group>
          </Select.Content>
        </Select.Root>

        <IconButton
          variant="surface"
          onClick={() => {
            handle_theme_appearance_update();
          }}
        >
          {appearance === theme_appearance_app_enum.DARK ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default Header;
