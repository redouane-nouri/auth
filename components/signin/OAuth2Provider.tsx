"use client";

import { OAuth2ProviderT } from "@/utils/types";
import { Button } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function OAuth2Provider({
  oAuth2Provider,
}: {
  oAuth2Provider: OAuth2ProviderT;
}) {
  const t = useTranslations("signinCard");
  const Icon = oAuth2Provider.icon;

  return (
    <Button
      onClick={() =>
        signIn(oAuth2Provider.id, {
          callbackUrl: "/",
        })
      }
      variant="outline"
      highContrast
    >
      <Icon />
      {oAuth2Provider.label}
    </Button>
  );
}
