"use client";

import { Theme } from "@radix-ui/themes";
import React, { useState } from "react";
import { theme_appearance_type } from "../../utils/types/app_types";
import Header from "./header";
/*
  We are using `Theme` and `Header` in same file to make it easy to pass the appearance and appearance set state action to the `Header` instead of creating a context.
*/
const ThemeAndHeader = ({
  theme_appearance,
  children,
}: {
  theme_appearance: theme_appearance_type;
  children: React.ReactNode;
}) => {
  /*
    This state will be used by the header component to change the theme appearance once the user clicks on the theme changer button.
  */
  const [appearance, set_appearance] =
    useState<theme_appearance_type>(theme_appearance);

  return (
    <Theme accentColor="gray" grayColor="slate" appearance={appearance}>
      <Header appearance={appearance} set_appearance={set_appearance} />
      {children}
    </Theme>
  );
};
export default ThemeAndHeader;
