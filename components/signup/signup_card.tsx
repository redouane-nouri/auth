import {
  ArrowRightIcon,
  ArrowTopRightIcon,
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

const SignupCard = () => {
  const t = useTranslations("signup_card");
  return (
    <Box>
      <Container size="1">
        <Card>
          <Flex direction="column" gapY="4">
            <Heading>{t("signup_heading")}</Heading>
            <Box>
              <Text>{t("username_label")}</Text>
              <TextField.Root placeholder={t("username_placeholder")} size="2">
                <TextField.Slot>
                  <PersonIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("username_required_hint")}
              </Text>
            </Box>
            <Box>
              <Text>{t("password_label")}</Text>
              <TextField.Root placeholder={t("password_placeholder")}>
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("password_required_hint")}
              </Text>
            </Box>
            <Box>
              {t("confirm_password")}
              <Text></Text>
              <TextField.Root placeholder={t("confirm_password_hint")}>
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                {t("password_does_not_match_hint")}
              </Text>
            </Box>
            <Badge color="crimson" className="!p-3">
              {t("username_exists")}
            </Badge>
            <Button highContrast>
              {t("sign_up")}
              <ArrowRightIcon />
            </Button>
            <Flex align="center">
              <Text size="2">
                {t("you_have_an_account?")}
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  {t("log_in_in_now!")}
                </Strong>
              </Text>
              <ArrowTopRightIcon />
            </Flex>
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupCard;
