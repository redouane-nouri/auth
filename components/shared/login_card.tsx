import {
  ArrowRightIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";

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
            </Box>
            <Box>
              <Text>Password</Text>
              <TextField.Root placeholder="Enter your password...">
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
            </Box>
            <Button highContrast>
              Log In
              <ArrowRightIcon />
            </Button>
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
