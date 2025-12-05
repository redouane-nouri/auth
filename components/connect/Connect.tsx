import { Box, Container, Tabs } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import LoginCard from "../login/LoginCard";
import SignupCard from "../signup/SignupCard";

export default function Connect() {
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
              {t("logIn")}
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="signup">
              {t("signUp")}
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
