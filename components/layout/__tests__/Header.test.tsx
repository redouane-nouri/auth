import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode, ThemeAppearance } from "@/utils/enums";
import Header from "../Header";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translationsObject = new Translation();
/*
 Mocking the useTranslations function from next-intl to return the translations.
*/
jest.mock("next-intl", () => ({
  /*
   use lazy loading to avoid jest throwing an error because jest.mock runs before the translationsObject is instantiated.
  */
  useTranslations: (nameSpace: keyof typeof arMessages) =>
    translationsObject.translationsMock(nameSpace),
}));
/*
  Mocking next/navigation's useRouter, since the real one needs an app router context.
*/
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));
/*
  Mocking cookies
*/
jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));
/*
  To control the mock implementation of each mocked import as needed
*/
const mockedUseRouter = useRouter as jest.Mock;
const mockedCookiesSet = Cookies.set as jest.Mock;
/*
  Header uses Radix Themes' Select, which needs to be rendered under a Theme provider
*/
const renderHeader = (
  props: Partial<React.ComponentProps<typeof Header>> = {},
) => {
  const setAppearance = jest.fn();
  render(
    <Theme>
      <Header
        appearance={ThemeAppearance.LIGHT}
        setAppearance={setAppearance}
        initialLocale={LanguageCode.EN}
        {...props}
      />
    </Theme>,
  );
  return { setAppearance };
};

describe("Header", () => {
  /*
    Should render the translated authentication heading in every language.
  */
  it.each(Object.values(LanguageCode))(
    "Should render the authentication heading in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().header;
      /*
        Arrange
      */
      renderHeader();
      /*
        Assert that the translated heading is displayed.
      */
      expect(screen.getByText(t.authentication)).toBeInTheDocument();
    },
  );
  /*
    Selecting a different language should update the select, set the NEXT_LOCALE cookie, and
    refresh the page.
  */
  it("Should update the locale cookie and refresh the page when a language is selected", async () => {
    const refresh = jest.fn();
    mockedUseRouter.mockReturnValueOnce({ refresh });
    /*
      Arrange
    */
    renderHeader();
    /*
      Act by opening the language select and picking Spanish
    */
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByText("Español"));
    /*
      Assert the select shows the new language, the cookie was set, and the page was refreshed.
    */
    expect(screen.getByRole("combobox")).toHaveTextContent("Español");
    expect(mockedCookiesSet).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      LanguageCode.ES,
      expect.objectContaining({ path: "/" }),
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  /*
    Clicking the theme button should flip the appearance and save it to the appearance cookie.
  */
  it("Should switch from light to dark appearance when the theme button is clicked", async () => {
    const t = translationsObject.getMessages().header;
    const { setAppearance } = renderHeader({
      appearance: ThemeAppearance.LIGHT,
    });
    /*
      Assert the button is labeled with the action it performs
    */
    const themeButton = screen.getByRole("button", {
      name: t.switchToDarkMode,
    });
    /*
      Act by clicking on the theme toggle button
    */
    await userEvent.click(themeButton);
    /*
      Assert appearance was flipped to dark and saved to the cookie.
    */
    expect(setAppearance).toHaveBeenCalledWith(ThemeAppearance.DARK);
    expect(mockedCookiesSet).toHaveBeenCalledWith(
      "appearance",
      ThemeAppearance.DARK,
      expect.objectContaining({ path: "/" }),
    );
  });
  /*
    Clicking the theme button should flip the appearance back to light from dark.
  */
  it("Should switch from dark to light appearance when the theme button is clicked", async () => {
    const t = translationsObject.getMessages().header;
    const { setAppearance } = renderHeader({
      appearance: ThemeAppearance.DARK,
    });
    /*
      Assert the button is labeled with the action it performs
    */
    const themeButton = screen.getByRole("button", {
      name: t.switchToLightMode,
    });
    /*
      Act by clicking on the theme toggle button
    */
    await userEvent.click(themeButton);
    /*
      Assert appearance was flipped to light and saved to the cookie.
    */
    expect(setAppearance).toHaveBeenCalledWith(ThemeAppearance.LIGHT);
    expect(mockedCookiesSet).toHaveBeenCalledWith(
      "appearance",
      ThemeAppearance.LIGHT,
      expect.objectContaining({ path: "/" }),
    );
  });
});
