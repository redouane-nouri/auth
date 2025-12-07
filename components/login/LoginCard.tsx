import {
  ArrowRightIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
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
import { socialProviders } from "../../utils/constants";

const LoginCard = () => {
  /*
    Using `loginCard` translations.
  */
  const t = useTranslations("loginCard");
  return (
    <Box>
      <Container size="1">
        <Card>
          <Flex direction="column" gapY="4">
            <Heading>{t("loginHeading")}</Heading>
            <Box>
              <Text>{t("emailTitle")}</Text>
              <TextField.Root
                aria-label={t("emailPlaceholder")}
                placeholder={t("emailPlaceholder")}
                size="2"
              >
                <TextField.Slot>
                  <PersonIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("emailRequiredHint")}
              </Text>
            </Box>
            <Box>
              <Text>{t("passwordTitle")}</Text>
              <TextField.Root
                aria-label={t("passwordPlaceholder")}
                placeholder={t("passwordPlaceholder")}
                type="password"
              >
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("passwordRequiredHint")}
              </Text>
            </Box>
            <Badge color="crimson" className="!p-3">
              {t("invalidCredentials")}
            </Badge>
            <Button highContrast>
              {t("logIn")}
              <ArrowRightIcon />
            </Button>
            <Flex align="center">
              <Text size="2">
                {t("noAccount")}
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  {t("signUpNow")}
                </Strong>
              </Text>
            </Flex>
            <Text align="center">{t("orSeparator")}</Text>
            {socialProviders.map((socialProvider, index) => (
              <Button key={index} variant="outline" highContrast>
                {<socialProvider.icon />}
                {socialProvider.label}
              </Button>
            ))}
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginCard;
