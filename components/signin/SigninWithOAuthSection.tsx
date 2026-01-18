"use client";

import { oAuth2Providers } from "../../utils/constants";
import { Badge, Flex } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useState } from "react";
import OAuth2Provider from "./OAuth2Provider";

export default function SigninWithOAuthSection() {
  /*
    Signin i18n messages
  */
  const t = useTranslations("signinCard");

  return (
    <Flex direction="column" gap="2">
      {oAuth2Providers.map((oAuth2Provider, index) => (
        <OAuth2Provider
          key={index}
          oAuth2Provider={oAuth2Provider}
        />
      ))}
    </Flex>
  );
}
