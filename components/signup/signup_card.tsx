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

const SignupCard = () => {
  return (
    <Box>
      <Container size="1">
        <Card>
          <Flex direction="column" gapY="4">
            <Heading>Signup</Heading>
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
                Password does not match
              </Text>
            </Box>
            <Box>
              <Text>Confirm Password</Text>
              <TextField.Root placeholder="Confirm your password...">
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>
              </TextField.Root>
              <Text color="crimson" size="1">
                Password does not match
              </Text>
            </Box>
            <Badge color="crimson" className="!p-3">
              Username already exist
            </Badge>
            <Button highContrast>
              Sign Up
              <ArrowRightIcon />
            </Button>
            <Flex align="center">
              <Text size="2">
                You have an account?
                <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                  Log In Now!
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
