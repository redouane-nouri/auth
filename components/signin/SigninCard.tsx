"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Strong,
  Text,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { socialProviders } from "../../utils/constants";
import SiginnWithCredentialsForm from "./SigninWithCredentialsForm";

const SigninCard = ({ switchToSignup }: { switchToSignup: () => void }) => {
  const t = useTranslations("signinCard");

  return (
    <Box>
      <Container size="1">
        <Card>
          <SiginnWithCredentialsForm />
          <Text align="center">{t("orSeparator")}</Text>
          {socialProviders.map((socialProvider, index) => (
            <Button key={index} variant="outline" highContrast>
              <socialProvider.icon />
              {socialProvider.label}
            </Button>
          ))}
          <Flex align="center">
            <Text size="2">
              {t("noAccount")}
              <Strong
                onClick={switchToSignup}
                className="hover:border-b-2 cursor-pointer ml-2 mr-1"
              >
                {t("signUpNow")}
              </Strong>
            </Text>
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default SigninCard;
