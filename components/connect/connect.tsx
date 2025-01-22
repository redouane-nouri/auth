import { Box, Container, Tabs } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import LoginCard from "../../components/login/login_card";
import SignupCard from "../../components/signup/signup_card";

export default function ConnectComponent() {
  /*
    Use `connect` translations.
  */
  const t = useTranslations("connect");
  return (
    <Box>
      <Container size="1" className="mt-10">
        <Tabs.Root className="TabsRoot" defaultValue="login">
          <Tabs.List className="TabsList mb-3">
            <Tabs.Trigger className="TabsTrigger" value="login">
              {t("log_in")}
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="signup">
              {t("sign_up")}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="TabsContent" value="login">
            <LoginCard />
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="signup">
            <SignupCard />
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </Box>
  );
}
