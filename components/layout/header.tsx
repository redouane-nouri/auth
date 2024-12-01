import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { Flex, IconButton, Select } from "@radix-ui/themes";
import { languages_app_constant } from "../../utils/constants/app_constants";

const Header = () => {
  return (
    <Flex px="3" gap="2" py="2" justify="end">
      <Select.Root defaultValue="en">
        <Select.Trigger />
        <Select.Content position="popper">
          <Select.Group>
            {languages_app_constant.map((language) => (
              <Select.Item value={language.value}>{language.label}</Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <IconButton variant="surface">
        <SunIcon />
      </IconButton>
      {/* to use in dark mode
      <MoonIcon /> */}
    </Flex>
  );
};

export default Header;
