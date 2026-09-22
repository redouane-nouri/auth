"use client";

import { Box, Card, Container, Strong, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import SiginnWithCredentialsForm from "./SigninWithCredentialsForm";
import SiginnWithEmailForm from "./SigninWithEmailForm";
import SigninWithOAuthSection from "./SigninWithOAuthSection";

const SigninCard = ({ switchToSignup }: { switchToSignup: () => void }) => {
  /*
    Login card i18n messages
  */
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
          <SigninWithOAuthSection />
          <Text size="2" className="mt-4 block">
            {t("noAccount")}
            <button
              type="button"
              onClick={switchToSignup}
              data-testid="switchToSignupButton"
              className="bg-transparent border-none p-0 font-[inherit] hover:border-b-2 cursor-pointer ml-2 mr-1"
            >
              <Strong>{t("signUpNow")}</Strong>
            </button>
          </Text>
        </Card>
      </Container>
    </Box>
  );
};

export default SigninCard;
