"use client";

import { useMutation } from "@tanstack/react-query";
import { oAuth2Providers } from "../../utils/constants";
import { Badge, Button, Flex } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useState } from "react";
import OAuth2Provider from "./OAuth2Provider";

export default function SigninWithOAuthSection() {
  /*
    Signin i18n messages
  */
  const t = useTranslations("signinCard");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <Flex direction="column" gap="2">
      {oAuth2Providers.map((oAuth2Provider, index) => (
        <OAuth2Provider key={index} oAuth2Provider={oAuth2Provider} />
      ))}
      {isError && (
        <Badge color="crimson" className="!p-3">
          {t("error")}
        </Badge>
      )}
      {isSuccess && (
        <Badge color="grass" className="!p-3">
          {t("success")}
        </Badge>
      )}
    </Flex>
  );
}
