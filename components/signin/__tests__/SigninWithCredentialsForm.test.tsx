import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@tanstack/react-query";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import SigninWithCredentialsForm from "../SigninWithCredentialsForm";
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
  Mocking next-auth/react's signIn
*/
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
/*
  Mocking next/navigation's useRouter
*/
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
/*
  To control the mock implementation of the mutation as needed.
*/
const mockedUseMutation = useMutation as jest.Mock;

describe("Signin With Credentials Form", () => {
  /*
    Clicking the login button with empty data should display email invalid and password min hints
  */
  it.each(Object.values(LanguageCode))(
    "Should display email and password hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinValidation;
      /*
        Arrange
      */
      render(<SigninWithCredentialsForm />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that email and password min message (required) is displayed
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(
        t.emailInvalid,
      );
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMin,
      );
    },
  );
  /*
    A maximum error message should be displayed when the max length is exceeded (60 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display email and password max length exceeded hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<SigninWithCredentialsForm />);
      /*
        Act by inserting long strings in email & password inputs.
      */
      await userEvent.type(screen.getByTestId("emailInput"), longString);
      await userEvent.type(screen.getByTestId("passwordInput"), longString);
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that email and password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(t.emailMax);
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMax,
      );
    },
  );
  /*
    Invalid credentials error displayed correctly
  */
  it.each(Object.values(LanguageCode))(
    "Should display login error message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinCard;
      /*
        Mock to return an invalid credentials error.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: new Error(t.invalidCredentials),
      }));
      /*
        Arrange
      */
      render(<SigninWithCredentialsForm />);
      /*
        Assert invalid credentials error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(
        t.invalidCredentials,
      );
    },
  );
  /*
    To check success login message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success login message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinCard;
      /*
        Mock to return a success login.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
      }));
      /*
        Arrange
      */
      render(<SigninWithCredentialsForm />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("successBadge")).toHaveTextContent(t.success);
    },
  );
});
