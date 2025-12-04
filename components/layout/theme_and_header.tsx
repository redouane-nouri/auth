"use client";

import { Theme } from "@radix-ui/themes";
import React, { useState } from "react";
import { Appearance } from "../../utils/types/app-types";
import Header from "./header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/*
  We are using `Theme` and `Header` in same file to make it easy to pass the appearance and appearance set state action to the `Header` instead of creating a context.
*/
const ThemeAndHeader = ({
  theme_appearance,
  children,
}: {
  theme_appearance: Appearance;
  children: React.ReactNode;
}) => {
  /*
    This state will be used by the header component to change the theme appearance once the user clicks on the theme changer button.
  */
  const [appearance, set_appearance] = useState<Appearance>(theme_appearance);
  /*
    The query client instance to handle react query's data fetching, cashing, etc.
  */
  const query_client = new QueryClient();

  return (
    <QueryClientProvider client={query_client}>
      <Theme accentColor="gray" grayColor="slate" appearance={appearance}>
        <Header appearance={appearance} set_appearance={set_appearance} />
        {children}
      </Theme>
    </QueryClientProvider>
  );
};
export default ThemeAndHeader;
