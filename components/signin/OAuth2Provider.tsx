"use client";

import { OAuth2ProviderT } from "@/utils/types";
import { Badge, Button } from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";

export default function OAuth2Provider({
  oAuth2Provider,
}: {
  oAuth2Provider: OAuth2ProviderT;
}) {
  const Icon = oAuth2Provider.icon;
  /*
    Signin i18n messages, shared with the other signin forms.
  */
  const t = useTranslations("signinCard");
  /*
    signIn() redirects to the provider on success, so this only ever settles if it fails before that.
  */
  const mutation = useMutation({
    mutationFn: () => signIn(oAuth2Provider.id, { callbackUrl: "/" }),
  });

  return (
    <>
      <Button
        onClick={() => mutation.mutate()}
        data-testid={`oAuth2ProviderButton-${oAuth2Provider.id}`}
        variant="outline"
        loading={mutation.isPending}
        disabled={mutation.isPending}
        highContrast
      >
        <Icon />
        {oAuth2Provider.label}
      </Button>
      {mutation.isError && (
        <Badge
          data-testid={`oAuth2ProviderError-${oAuth2Provider.id}`}
          color="crimson"
          className="!p-3 block whitespace-normal break-words"
        >
          {t("error")}
        </Badge>
      )}
    </>
  );
}
