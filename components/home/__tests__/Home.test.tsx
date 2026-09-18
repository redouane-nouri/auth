import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@tanstack/react-query";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import Home from "../Home";
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
  Initial mock implementation
*/
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isError: false,
    isSuccess: false,
    isPending: false,
  })),
}));
/*
  Mocking next-auth/react's signOut
*/
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));
/*
  To control the mock implementation of the mutation as needed.
*/
const mockedUseMutation = useMutation as jest.Mock;

describe("Home", () => {
  /*
    Should render the translated greeting with the user's name substituted in, in every language.
  */
  it.each(Object.values(LanguageCode))(
    "Should render the greeting with the user's name in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().home;
      /*
        Arrange
      */
      render(<Home name="Valid" />);
      /*
        Assert that the greeting is displayed with the user's name substituted in.
      */
      expect(
        screen.getByText(t.hello.replace("{name}", "Valid")),
      ).toBeInTheDocument();
    },
  );
  /*
    Clicking the sign out button should trigger the sign out mutation.
  */
  it("Should trigger the sign out mutation when the sign out button is clicked", async () => {
    const mutate = jest.fn();
    mockedUseMutation.mockReturnValueOnce({
      mutate,
      isError: false,
      isSuccess: false,
      isPending: false,
    });
    /*
      Arrange
    */
    render(<Home name="Valid" />);
    /*
      Act by clicking on the sign out button
    */
    await userEvent.click(screen.getByRole("button"));
    /*
      Assert the sign out mutation was triggered.
    */
    expect(mutate).toHaveBeenCalledTimes(1);
  });
  /*
    Unexpected error is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display error message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().home;
      /*
        Mock to return an unexpected error.
      */
      mockedUseMutation.mockReturnValueOnce({
        mutate: jest.fn(),
        isError: true,
        isSuccess: false,
        isPending: false,
      });
      /*
        Arrange
      */
      render(<Home name="Valid" />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByText(t.error)).toBeInTheDocument();
    },
  );
  /*
    To check success sign out message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success sign out message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().home;
      /*
        Mock to return a success sign out.
      */
      mockedUseMutation.mockReturnValueOnce({
        mutate: jest.fn(),
        isError: false,
        isSuccess: true,
        isPending: false,
      });
      /*
        Arrange
      */
      render(<Home name="Valid" />);
      /*
        Assert success sign out message is displayed.
      */
      expect(screen.getByText(t.successSignout)).toBeInTheDocument();
    },
  );
});
