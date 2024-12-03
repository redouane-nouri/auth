"use client";

import { SunIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Select } from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { map_value_to_label_app_constant } from "../../utils/constants/app_constants";
import { language_values_app_enum } from "../../utils/enums/app_enums";

const Header = () => {
  /*
    To refresh the page once the user changes the language because next-intl is SSR.
  */
  const router = useRouter();
  /*
    This state holds the locale, it will changes once the page loaded and getting the prefered language by the user from the `NEXT_LOCALE` cookie.
    Default to `en` if the user didn't choose yet or the cookie has invalid language value.
  */
  const [locale, set_locale] = useState<language_values_app_enum>(
    language_values_app_enum.EN,
  );

  /*
    The handler of the select changing event.
    Once the user chooses a languge from the select menu, this handler will be triggered and:
      - Set the user prefered language to `NEXT_LOCALE` cookie.
      - Changes the local state.
      - Refresh the page using next router because next-intl is SSR.
  */
  const handle_language_value_changed = (value: language_values_app_enum) => {
    set_locale(value);
    Cookies.set("NEXT_LOCALE", value, {
      expires: 365,
      path: "/",
      sameSite: "Lax",
    });
    router.refresh();
  };

  /*
    This will be executed the first time the page is loaded to check if there is any valid value of a user perefered language in the `NEXT_LOCALE` cookie, if does not exist or invalid value then default to `en`.
  */
  useEffect(() => {
    let next_locale = Cookies.get("NEXT_LOCALE") as language_values_app_enum;

    const language_value = Object.values(language_values_app_enum).includes(
      next_locale,
    )
      ? next_locale
      : language_values_app_enum.EN;

    set_locale(language_value);
  }, []);

  return (
    <Flex px="3" gap="2" py="2" justify="end">
      <Select.Root
        value={locale}
        onValueChange={(value) => {
          handle_language_value_changed(value as language_values_app_enum);
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
              ),
            )}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <IconButton variant="surface">
        <SunIcon />
      </IconButton>
      {/* to use in dark mode
      <MoonIcon /> */}
    </Flex>
  );
};

export default Header;
