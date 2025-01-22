import { Flex, Heading, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";

const NotFoundPage = () => {
  /*
    Use `404` transalations.
  */
  const t = useTranslations("404");
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
      <Text size="4">{t("page_not_found")}</Text>
    </Flex>
  );
};

export default NotFoundPage;
