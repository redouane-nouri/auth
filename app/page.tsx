"use client";

import { signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Badge, Box, Button, Container, Flex } from "@radix-ui/themes";
import { useTranslations } from "next-intl";

export default function SignOutButton() {
  const t = useTranslations("home");

  const mutation = useMutation({
    mutationFn: async () => {
      return await signOut({
        redirect: true,
        callbackUrl: "/connect",
      });
    },
  });

  return (
    <Container size="1">
      <Flex direction="column" gapY="4">
        {t("home")}
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          highContrast
        >
          {t("signOut")}
        </Button>
        {mutation.isError && (
          <Badge color="crimson" className="!p-3">
            {t("error")}
          </Badge>
        )}
        {mutation.isSuccess && (
          <Badge color="grass" className="!p-3">
            {t("successSignout")}
          </Badge>
        )}
      </Flex>
    </Container>
  );
}
