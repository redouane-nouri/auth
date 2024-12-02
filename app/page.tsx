import Header from "../components/layout/header";
import LoginCard from "../components/login/login_card";
import { Tabs, Box, Container } from "@radix-ui/themes";
import SignupCard from "../components/signup/signup_card";

export default function Home() {
  return (
    <Box>
      <Container size="1" className="mt-10">
        <Tabs.Root className="TabsRoot" defaultValue="login">
          <Tabs.List className="TabsList mb-3" aria-label="Authentication">
            <Tabs.Trigger className="TabsTrigger" value="login">
              Log In
            </Tabs.Trigger>
            <Tabs.Trigger className="TabsTrigger" value="signup">
              Sign Up
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
