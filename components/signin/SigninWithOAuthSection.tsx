"use client";

import { oAuth2Providers } from "../../utils/constants";
import { Flex } from "@radix-ui/themes";
import OAuth2Provider from "./OAuth2Provider";

export default function SigninWithOAuthSection() {
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
