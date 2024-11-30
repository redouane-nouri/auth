import {
  ArrowRightIcon,
  LockClosedIcon,
  PersonIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
  Strong,
} from "@radix-ui/themes";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

const LoginCard = () => {
  return (
    <Box>
      <Container size="1" className="mt-40">
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
                No Account?
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  Sign Up Now!
                </Strong>
              </Text>
              <ArrowTopRightIcon />
            </Flex>
            <Text align="center">- Or -</Text>
            <Button variant="outline" highContrast>
              <FaGithub />
              GitHub
            </Button>
            <Button variant="outline" highContrast>
              <FaGoogle />
              Google
            </Button>
            <Button variant="outline" highContrast>
              <FaFacebook />
              Facebook
            </Button>
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginCard;
