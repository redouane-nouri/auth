import { socialProviders } from "../../utils/constants";
import { Button, Flex } from "@radix-ui/themes";

export default function SigninWithOAuthSection() {
  return (
    <Flex direction="column" gap="2">
      {socialProviders.map((socialProvider, index) => (
        <Button key={index} variant="outline" highContrast>
          <socialProvider.icon />
          {socialProvider.label}
        </Button>
      ))}
    </Flex>
  );
}
