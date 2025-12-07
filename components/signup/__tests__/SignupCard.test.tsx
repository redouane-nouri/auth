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
    Snapshot testing to ensure the SignupCard is rendered with the correct language messages
  */
  it.each(Object.values(LanguageCode))(
    "Should render UI with %s language",
    (languageValueEnum) => {
      /*
        Set the current language so the mocked useTranslations function will return messages for the current language.
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
    Clicking the signup button with empty data should display email and password required hints
  */
  it.each(Object.values(LanguageCode))(
    "Should display email and password required hints in %s language",
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
        Assert that email and password min message (required) is displayed with the correct language and place
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(
        t.emailString,
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
    "Should display email and password max length is exceeded hints in %s language",
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
        Act by inserting long string in email & password inputs.
      */
      await userEvent.type(screen.getByTestId("emailInput"), longString);
      await userEvent.type(screen.getByTestId("passwordInput"), longString);
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that email and password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(
        t.emailInvalid,
      );
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMax,
      );
    },
  );

  /*
    A regex error message should be displayed when the regex is violated for email or password
  */
  it.each(Object.values(LanguageCode))(
    "Should display email and password regex hints in %s language",
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
        Act by inserting invalid regex for both email and password
      */
      const passwordInput = screen.getByTestId("passwordInput");
      const emailInput = screen.getByTestId("emailInput");
      await userEvent.type(emailInput, "invalid#!@#");
      await userEvent.type(passwordInput, "lowercase");
      await userEvent.click(screen.getByTestId("submitButton"));
      const emailHintSpan = screen.getByTestId("emailHint");
      const passwordHintSpan = screen.getByTestId("passwordHint");
      /*
        Assert that email and password regex message is displayed with the correct language and place.
      */
      expect(emailHintSpan).toHaveTextContent(t.emailInvalid);
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
        Respect the regex for email and password (by adding special chars for password), then expect no hint messages.
      */
      await userEvent.clear(emailInput);
      await userEvent.clear(passwordInput);
      await userEvent.type(emailInput, "valid@mail.test");
      await userEvent.type(passwordInput, "lowercaseUPPERCASE123!@#");
      expect(screen.queryByTestId("emailHint")).toBeNull();
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
        Act by inserting non-equal passwords
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
        Mock to return an expected error
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
    Mock axios.isAxiosError to true to trigger axios error handling.
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
        Mock to return a success creation message.
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
