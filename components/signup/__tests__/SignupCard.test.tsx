import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import SignupCard from "../SignupCard";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translationsObject = new Translation();
/*
 Mocking the useTranslations function from next-intl to return the translations.
*/
jest.mock("next-intl", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translationsObject get initiated.
  */
  useTranslations: (nameSpace: keyof typeof arMessages) =>
    translationsObject.translationsMock(nameSpace),
}));
/*
  Initial Mock Implemntation
*/
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    isError: false,
    isSuccess: false,
    isPending: false,
  })),
}));
/*
  To control the mock implementation of the mutation as needed.
*/
const { useMutation } = require("@tanstack/react-query");

describe("Signup Card", () => {
  /*
    Snapshot Testing that the Signup card is rendered with the correct language messages
  */
  it.each(Object.values(LanguageCode))(
    "Should render UI with %s language",
    (languageValueEnum) => {
      /*
        Set the current language so mock useTranslation function will return the messages with the current language
      */
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      /*
        Arrange
      */
      const { container } = render(<SignupCard />);
      /*
        Assert
      */
      expect(container).toMatchSnapshot();
    },
  );
  /*
    A click on the signup button with empty data should display username and password hints
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password required hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      /*
        Get the messages with the current language to compare with.
      */
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that username and password min message (required) is displayed with the correct language and place
      */
      expect(screen.getByTestId("usernameHint")).toHaveTextContent(
        t.usernameMin,
      );
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMin,
      );
    },
  );
  /*
    A maximum error message should be displayed when the max length is exceeded (30 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password max length is exceeded hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting long string in username & password inputs.
      */
      await userEvent.type(screen.getByTestId("usernameInput"), longString);
      await userEvent.type(screen.getByTestId("passwordInput"), longString);
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that username and password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("usernameHint")).toHaveTextContent(
        t.usernameMax,
      );
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMax,
      );
    },
  );
  /*
    A regex error message should be displayed when the regex is violated for username or password
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password regex hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting non valid regex for both username and password
      */
      const passwordInput = screen.getByTestId("passwordInput");
      const usernameInput = screen.getByTestId("usernameInput");
      await userEvent.type(usernameInput, "invalid#!@#");
      await userEvent.type(passwordInput, "lowercase");
      await userEvent.click(screen.getByTestId("submitButton"));
      const usernameHintSpan = screen.getByTestId("usernameHint");
      const passwordHintSpan = screen.getByTestId("passwordHint");
      /*
        Assert that username and password regex message is displayed with the correct language and place.
      */
      expect(usernameHintSpan).toHaveTextContent(t.usernameRegex);
      expect(passwordHintSpan).toHaveTextContent(t.passwordRegexUppercase);
      /*
        Add uppercase letters
      */
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, "lowercaseUPPERCASE");
      expect(passwordHintSpan).toHaveTextContent(t.passwordRegexNumber);
      /*
        Add numbers
      */
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, "lowercaseUPPERCASE123");
      expect(passwordHintSpan).toHaveTextContent(
        t.passwordSpecialCharacter,
      );
      /*
        respect the regex for username and password (by adding special chars for password), then expect to have not hint messages.
      */
      await userEvent.clear(usernameInput);
      await userEvent.clear(passwordInput);
      await userEvent.type(usernameInput, "username");
      await userEvent.type(passwordInput, "lowercaseUPPERCASE123!@#");
      expect(screen.queryByTestId("usernameHint")).toBeNull();
      expect(screen.queryByTestId("passwordHint")).toBeNull();
    },
  );
  /*
    A confirm password does not match should be displayed when password and confirm password are not equal
  */
  it.each(Object.values(LanguageCode))(
    "Should display confirm password does not match with password in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting non equal passwords
      */
      await userEvent.type(screen.getByTestId("passwordInput"), "Password1@");
      await userEvent.type(
        screen.getByTestId("confirmPasswordInput"),
        "Password2@",
      );
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert password does not match is displayed
      */
      expect(
        screen.getByTestId("confirmPasswordHint"),
      ).toHaveTextContent(t.passwordsDontMatch);
    },
  );
  /*
    Unexpected error is displayed correctly
  */
  it.each(Object.values(LanguageCode))(
    "Should display unexpected creation error message in %s language",
    async (languageValueEnum) => {
      /*
        Mock to return an excpected error
      */
      useMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: "unexpected error.",
      }));
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(t.error);
    },
  );
  /*
    Mock isAxiosError to true to trigger axios error.
  */
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  /*
    To check axios Error creation is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display axios error creation message in %s language",
    async (languageValueEnum) => {
      /*
        Mock to return an axios error
      */
      useMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: { response: { data: { error: "Axios error" } } },
      }));
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange.
      */
      render(<SignupCard />);
      /*
        Assert axios error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(
        "Axios error",
      );
    },
  );
  /*
    To check success creation message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success creation message in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        Mock to return an success creation message.
      */
      useMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
        data: { data: { message: t.success } },
      }));
      /*
        Arrange.
      */
      render(<SignupCard />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("successBadge")).toHaveTextContent(t.success);
    },
  );
});
