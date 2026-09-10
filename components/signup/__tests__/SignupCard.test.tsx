import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
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
  Mock Axios
*/
jest.mock("axios", () => ({
  create: jest.fn(),
  isAxiosError: jest.fn(() => false),
}));

/*
  To control the mock implementation of the mutation as needed.
*/
const mockedUseMutation = useMutation as unknown as jest.Mock;

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
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      /*
        Arrange
      */
      const { container } = render(<SignupCard switchToSignin={() => {}} />);
      /*
        Assert
      */
      expect(container).toMatchSnapshot();
    }
  );

  /*
    Clicking the signup button with empty data should display email is invalid, name and password is required hints
  */
  it.each(Object.values(LanguageCode))(
    "Should display name, email and password required hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      /*
        Get the messages with the current language to compare with.
      */
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that name, email and password min message (required) is displayed with the correct language and place
      */
      expect(screen.getByTestId("nameHint")).toHaveTextContent(t.nameRequired);
      expect(screen.getByTestId("emailHint")).toHaveTextContent(t.emailInvalid);
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMin
      );
    }
  );

  /*
    A maximum error message should be displayed when the max length is exceeded (60 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display name, email and password max length is exceeded hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signupValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Act by inserting long string in email & password inputs.
      */
      await userEvent.type(screen.getByTestId("nameInput"), longString);
      await userEvent.type(screen.getByTestId("emailInput"), longString);
      await userEvent.type(screen.getByTestId("passwordInput"), longString);
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that name, email and password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("nameHint")).toHaveTextContent(t.nameMax);
      expect(screen.getByTestId("emailHint")).toHaveTextContent(t.emailMax);
      expect(screen.getByTestId("passwordHint")).toHaveTextContent(
        t.passwordMax
      );
    }
  );

  /*
    A regex error message should be displayed when the regex is for password
  */
  it.each(Object.values(LanguageCode))(
    "Should display password regex hints in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Act by inserting invalid regex for password
      */
      const passwordInput = screen.getByTestId("passwordInput");
      const emailInput = screen.getByTestId("emailInput");
      const nameInput = screen.getByTestId("nameInput");
      await userEvent.type(nameInput, "valid");
      await userEvent.type(emailInput, "valid@mail.test");
      await userEvent.type(passwordInput, "lowercase");
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
        Respect the email and password constraints then expect no hint messages.
      */
      await userEvent.clear(emailInput);
      await userEvent.clear(passwordInput);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "valid");
      await userEvent.type(emailInput, "valid@mail.test");
      await userEvent.type(passwordInput, "lowercaseUPPERCASE123!@#");
      expect(screen.queryByTestId("nameHint")).not.toBeInTheDocument();
      expect(screen.queryByTestId("emailHint")).not.toBeInTheDocument();
      expect(screen.queryByTestId("passwordHint")).not.toBeInTheDocument();
    }
  );

  /*
    A confirm password does not match should be displayed when password and confirm password are not equal
  */
  it.each(Object.values(LanguageCode))(
    "Should display confirm password does not match with password in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Act by inserting non-equal passwords
      */
      await userEvent.type(
        screen.getByTestId("passwordInput"),
        "ValidPassword1@"
      );
      await userEvent.type(
        screen.getByTestId("confirmPasswordInput"),
        "ValidPassword2@"
      );
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert password does not match is displayed
      */
      expect(screen.getByTestId("confirmPasswordHint")).toHaveTextContent(
        t.passwordsDontMatch
      );
    }
  );

  /*
    Errors like unexpected error, and user already signed in are displayed correctly.
    The message changing depends on the new Error(message), here we are testing for unepected only, no need for the already signed in because is just changing the content of the error object
  */
  it.each(Object.values(LanguageCode))(
    "Should display unexpected creation error message in %s language",
    async (languageValueEnum) => {
      /*
        Mock axios.isAxiosError to false to prevent triggering axios error handling.
      */
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);
      /*
        Mock to return unexpected error
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: new Error(t.error),
      }));
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signupValidation;
      /*
        Arrange
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(t.error);
    }
  );

  /*
    To check axios Error creation is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display axios error creation message in %s language",
    async () => {
      /*
        Mock axios.isAxiosError to true to trigger axios error handling.
      */
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      /*
        Mock to return an axios error
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: { response: { data: { error: "Axios error" } } },
      }));
      /*
        Arrange.
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Assert axios error is displayed.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent("Axios error");
    }
  );
  /*
    To check switching to signin works from the "Have an account? Sign in now!" message
  */
  it("Should switch to signin page", async () => {
    const switchToSignin = jest.fn();
    /*
      Arrange.
    */
    render(<SignupCard switchToSignin={switchToSignin} />);
    /*
      Act
    */
    await userEvent.click(screen.getByTestId("switchToSigninButton"));
    /*
      Assert function has been called
    */
    expect(switchToSignin).toHaveBeenCalledTimes(1);
  });
  /*
    To check success creation message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success creation message in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signupValidation;
      /*
        Mock to return a success creation message.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
        data: { data: { message: t.success } },
      }));
      /*
        Arrange.
      */
      render(<SignupCard switchToSignin={() => {}} />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("successBadge")).toHaveTextContent(t.success);
    }
  );
});
