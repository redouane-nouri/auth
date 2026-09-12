"use client";

import { signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Badge, Box, Button, Container, Flex, Heading } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });

export default function Home({ name }: { name: string }) {
  /*
    Home i18n messages
  */
  const t = useTranslations("home");

  /*
    Signout Mutation
  */
  const mutation = useMutation({
    mutationFn: async () => {
      return await signOut({
        redirect: true,
        callbackUrl: "/connect",
      });
    },
  });

  return (
    <Box my="auto">
      <Container size="1">
        <Flex direction="column" align="center" gapY="4">
          <Heading as="h1" size="6" className={poppins.className}>
            {t("hello", { name })}
          </Heading>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={mutation.isSuccess}
            highContrast
          >
            {t("signOut")}
          </Button>
          {mutation.isError && (
            <Badge color="crimson" className="!p-3 block whitespace-normal break-words">
              {t("error")}
            </Badge>
          )}
          {mutation.isSuccess && (
            <Badge color="grass" className="!p-3 block whitespace-normal break-words">
              {t("successSignout")}
            </Badge>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
