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
import SiginnWithEmailForm from "./SigninWithEmailForm";

const SigninCard = ({ switchToSignup }: { switchToSignup: () => void }) => {
  const t = useTranslations("signinCard");

  return (
    <Box>
      <Container size="1">
        <Card>
          <SiginnWithCredentialsForm />
          <Text className="block mx-auto mt-7 mb-3" align="center">
            {t("orSeparator")}
          </Text>
          <SiginnWithEmailForm />
          <Text className="block mx-auto mt-7 mb-3" align="center">
            {t("orSeparator")}
          </Text>
          <Flex direction="column" gap="2">
            {socialProviders.map((socialProvider, index) => (
              <Button key={index} variant="outline" highContrast>
                <socialProvider.icon />
                {socialProvider.label}
              </Button>
            ))}
          </Flex>
          <Text size="2" className="mt-4 block">
            {t("noAccount")}
            <Strong
              onClick={switchToSignup}
              className="hover:border-b-2 cursor-pointer ml-2 mr-1"
            >
              {t("signUpNow")}
            </Strong>
          </Text>
        </Card>
      </Container>
    </Box>
  );
};

export default SigninCard;
