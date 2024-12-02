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
import { social_providers_app_constant } from "../../utils/constants/app_constants";

const LoginCard = () => {
  return (
    <Box>
      <Container size="1">
        <Card>
          <Flex direction="column" gapY="4">
            <Heading>Login</Heading>
            <Box>
              <Text>Username</Text>
              <TextField.Root placeholder="Enter your username..." size="2">
                <TextField.Slot>
                  <PersonIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                Username Required
              </Text>
            </Box>
            <Box>
              <Text>Password</Text>
              <TextField.Root placeholder="Enter your password...">
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                Password Required
              </Text>
            </Box>
            <Badge color="crimson" className="!p-3">
              Invalid Username or Password
            </Badge>
            <Button highContrast>
              Log In
              <ArrowRightIcon />
            </Button>
            <Flex align="center">
              <Text size="2">
                No account?
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  Sign Up Now!
                </Strong>
              </Text>
              <ArrowTopRightIcon />
            </Flex>
            <Text align="center">- Or -</Text>
            {social_providers_app_constant.map((social_provider, index) => (
              <Button key={index} variant="outline" highContrast>
                {<social_provider.icon />}
                {social_provider.name}
              </Button>
            ))}
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginCard;
