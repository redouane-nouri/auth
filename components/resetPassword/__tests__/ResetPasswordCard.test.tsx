import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import ResetPasswordCard from "../ResetPasswordCard";
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
  Mock Axios
*/
jest.mock("axios", () => ({
  create: jest.fn(),
  isAxiosError: jest.fn(() => false),
}));
/*
  Mocking next/navigation's useSearchParams, defaulting to a valid token so the form renders.
*/
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => "valid-token") })),
}));
/*
  To control the mock implementation of each mocked import as needed
*/
const mockedUseMutation = useMutation as jest.Mock;
const mockedIsAxiosError = axios.isAxiosError as unknown as jest.Mock;
const mockedUseSearchParams = useSearchParams as jest.Mock;

describe("Reset Password Card", () => {
  /*
    Without a token in the url, an invalid link message should be displayed instead of the form.
  */
  it.each(Object.values(LanguageCode))(
    "Should display invalid token message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordCard;
      /*
        Mock the url to have no token, restored right after so later tests still get a valid one.
      */
      mockedUseSearchParams.mockReturnValue({ get: () => null });
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Assert that the invalid token message is displayed and the form is not.
      */
      expect(screen.getByTestId("invalidTokenBadge")).toHaveTextContent(
        t.invalidToken,
      );
      expect(screen.queryByTestId("passwordInput")).not.toBeInTheDocument();
      mockedUseSearchParams.mockReturnValue({
        get: () => "valid-token",
      });
    },
  );
  /*
    Clicking the reset button with empty data should display the password required hint
  */
  it.each(Object.values(LanguageCode))(
    "Should display password hint in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that the password min message (required) is displayed with the correct language and place
      */
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMin,
      );
    },
  );
  /*
    A maximum error message should be displayed when the max length is exceeded (60 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display password max length exceeded hint in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Act by inserting the same long string in both password inputs.
      */
      await userEvent.type(screen.getByTestId("passwordInput"), longString);
      await userEvent.type(
        screen.getByTestId("confirmPasswordInput"),
        longString,
      );
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that the password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMax,
      );
    },
  );

  /*
    A regex error message should be displayed when the regex is for password
  */
  it.each(Object.values(LanguageCode))(
    "Should display password regex hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Act by inserting invalid regex for password
      */
      const passwordInput = screen.getByTestId("passwordInput");
      const confirmPasswordInput = screen.getByTestId("confirmPasswordInput");
      await userEvent.type(passwordInput, "lowercase");
      await userEvent.type(confirmPasswordInput, "lowercase");
      await userEvent.click(screen.getByTestId("submitButton"));
      const passwordHintSpan = screen.getByTestId("passwordHint");
      /*
        Assert that password regex message is displayed with the correct language and place.
      */
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
      expect(passwordHintSpan).toHaveTextContent(t.passwordSpecialCharacter);
      /*
        Respect the password constraints and match confirmPassword, then expect no hint messages.
      */
      await userEvent.clear(passwordInput);
      await userEvent.clear(confirmPasswordInput);
      await userEvent.type(passwordInput, "lowercaseUPPERCASE123!@#");
      await userEvent.type(confirmPasswordInput, "lowercaseUPPERCASE123!@#");
      expect(screen.queryByTestId("passwordHint")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("confirmPasswordHint"),
      ).not.toBeInTheDocument();
    },
  );
  /*
    A confirm password does not match should be displayed when password and confirm password are not equal
  */
  it.each(Object.values(LanguageCode))(
    "Should display confirm password does not match with password in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Act by inserting non-equal passwords
      */
      await userEvent.type(
        screen.getByTestId("passwordInput"),
        "ValidPassword1@",
      );
      await userEvent.type(
        screen.getByTestId("confirmPasswordInput"),
        "ValidPassword2@",
      );
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert password does not match is displayed
      */
      expect(screen.getByTestId("confirmPasswordHint")).toHaveTextContent(
        t.passwordsDontMatch,
      );
    },
  );
  /*
    Unexpected error is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display unexpected error message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordCard;
      /*
        Mock axios.isAxiosError to false to prevent triggering axios error handling.
      */
      mockedIsAxiosError.mockReturnValue(false);
      /*
        Mock to return an unexpected error.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: new Error(t.error),
      }));
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(t.error);
    },
  );
  /*
    To check axios Error creation is displayed correctly.
  */
  it("Should display axios error message", () => {
    /*
      Mock axios.isAxiosError to true to trigger axios error handling.
    */
    mockedIsAxiosError.mockReturnValue(true);
    /*
      Mock to return an axios error.
    */
    mockedUseMutation.mockImplementation(() => ({
      isError: true,
      isSuccess: false,
      isPending: false,
      error: { response: { data: { error: "Axios error" } } },
    }));
    /*
      Arrange
    */
    render(<ResetPasswordCard />);
    /*
      Assert axios error is displayed.
    */
    expect(screen.getByTestId("errorBadge")).toHaveTextContent("Axios error");
  });
  /*
    To check that a non-string axios error data (like the zod validation object the API returns on a 400) falls back to the generic error message.
  */
  it.each(Object.values(LanguageCode))(
    "Should display generic error message when axios error data is not a string in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordCard;
      /*
        Mock axios.isAxiosError to true to trigger axios error handling.
      */
      mockedIsAxiosError.mockReturnValue(true);
      /*
        Mock to return an axios error whose data.error is an object, not a string.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: { response: { data: { error: { _errors: ["some error"] } } } },
      }));
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Assert the generic error message is displayed instead of the object.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(t.error);
    },
  );
  /*
    To check success reset message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success reset message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      /*
        Mock to return a success reset message, as the server would send back.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
        data: { data: { message: t.success } },
      }));
      /*
        Arrange
      */
      render(<ResetPasswordCard />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("successBadge")).toHaveTextContent(t.success);
    },
  );
});
