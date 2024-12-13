import { ArrowRightIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Strong,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { social_providers_app_constant } from "../../utils/constants/app_constants";

const LoginCard = () => {
  /*
    Using `login_card` translations.
  */
  const t = useTranslations("login_card");
  return (
    <Box>
      <Container size="1">
        <Card>
          <Flex direction="column" gapY="4">
            <Heading>{t("login_heading")}</Heading>
            <Box>
              <Text>{t("username_title")}</Text>
              <TextField.Root
                aria-label={t("username_placeholder")}
                placeholder={t("username_placeholder")}
                size="2"
              >
                <TextField.Slot>
                  <PersonIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("username_required_hint")}
              </Text>
            </Box>
            <Box>
              <Text>{t("password_title")}</Text>
              <TextField.Root
                aria-label={t("password_placeholder")}
                placeholder={t("password_placeholder")}
                type="password"
              >
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("password_required_hint")}
              </Text>
            </Box>
            <Badge color="crimson" className="!p-3">
              {t("invalid_credentials")}
            </Badge>
            <Button highContrast>
              {t("log_in")}
              <ArrowRightIcon />
            </Button>
            <Flex align="center">
              <Text size="2">
                {t("no_account?")}
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  {t("sign_up_now!")}
                </Strong>
              </Text>
            </Flex>
            <Text align="center">{t("- Or -")}</Text>
            {social_providers_app_constant.map((social_provider, index) => (
              <Button key={index} variant="outline" highContrast>
                {<social_provider.icon />}
                {social_provider.label}
              </Button>
            ))}
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginCard;
