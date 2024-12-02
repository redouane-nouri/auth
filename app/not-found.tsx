import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import React from "react";

const NotFoundPage = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="h-[calc(100vh-48px)]"
    >
      <Heading as="h6" size="9">
        404
      </Heading>
      <Text size="4">Page Not Found</Text>
    </Flex>
  );
};

export default NotFoundPage;
