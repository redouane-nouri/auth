"use client";

import { Box, Container, Tabs } from "@radix-ui/themes";
import SigninCard from "../signin/SigninCard";
import SignupCard from "../signup/SignupCard";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function Connect() {
  const [tab, setTab] = useState("login");
  /*
    Use `connect` translations.
  */
  const t = useTranslations("connect");
  return (
    <Box>
      <Container size="1" className="mt-10">
        <Tabs.Root
          className="TabsRoot"
          defaultValue="login"
          value={tab}
          onValueChange={setTab}
        >
          <Tabs.List className="TabsList mb-3">
            <Tabs.Trigger className="TabsTrigger" value="login">
              {t("logIn")}
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="signup">
              {t("signUp")}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="TabsContent" value="login">
            <SigninCard switchToSignup={() => setTab("signup")} />
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="signup">
            <SignupCard />
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </Box>
  );
}
