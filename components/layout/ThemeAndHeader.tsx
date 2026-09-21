"use client";

import { Separator, Theme } from "@radix-ui/themes";
import React, { useState } from "react";
import { Appearance } from "../../utils/types";
import { LanguageCode } from "../../utils/enums";
import Header from "./Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/*
  We are using `Theme` and `Header` in same file to make it easy to pass the appearance and appearance set state action to the `Header` instead of creating a context.
*/
const ThemeAndHeader = ({
  themeAppearance,
  initialLocale,
  children,
}: {
  themeAppearance: Appearance;
  initialLocale: LanguageCode;
  children: React.ReactNode;
}) => {
  /*
    This state will be used by the header component to change the theme appearance once the user clicks on the theme changer button.
  */
  const [appearance, setAppearance] = useState<Appearance>(themeAppearance);
  /*
    Built once via useState's lazy initializer.
  */
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="gray" grayColor="slate" className="flex flex-col min-h-screen" appearance={appearance}>
        <Header appearance={appearance} setAppearance={setAppearance} initialLocale={initialLocale} />
        <Separator className="w-full" />
        {children}
      </Theme>
    </QueryClientProvider>
  );
};
export default ThemeAndHeader;
