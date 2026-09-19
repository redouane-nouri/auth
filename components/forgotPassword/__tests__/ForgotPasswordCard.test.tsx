import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import ForgotPasswordCard from "../ForgotPasswordCard";
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
  To control the mock implementation of each mocked import as needed
*/
const mockedUseMutation = useMutation as jest.Mock;
const mockedIsAxiosError = axios.isAxiosError as unknown as jest.Mock;

describe("Forgot Password Card", () => {
  /*
    Clicking the submit button with empty data should display the email invalid hint
  */
  it.each(Object.values(LanguageCode))(
    "Should display email hint in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().forgotPasswordValidation;
      /*
        Arrange
      */
      render(<ForgotPasswordCard />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that the email invalid hint is displayed with the correct language and place
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(
        t.emailInvalid,
      );
    },
  );
  /*
    A maximum error message should be displayed when the max length is exceeded (60 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display email max length exceeded hint in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().forgotPasswordValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<ForgotPasswordCard />);
      /*
        Act by inserting a long string in the email input.
      */
      await userEvent.type(screen.getByTestId("emailInput"), longString);
      await userEvent.click(screen.getByTestId("submitButton"));
      /*
        Assert that the email max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("emailHint")).toHaveTextContent(t.emailMax);
    },
  );
  /*
    Unexpected error is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display unexpected error message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().forgotPasswordCard;
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
      render(<ForgotPasswordCard />);
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
    render(<ForgotPasswordCard />);
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
      const t = translationsObject.getMessages().forgotPasswordCard;
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
      render(<ForgotPasswordCard />);
      /*
        Assert the generic error message is displayed instead of the object.
      */
      expect(screen.getByTestId("errorBadge")).toHaveTextContent(t.error);
    },
  );
  /*
    To check success message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().forgotPasswordValidation;
      /*
        Mock to return a success message, as the server would send back.
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
      render(<ForgotPasswordCard />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("successBadge")).toHaveTextContent(t.success);
    },
  );
});
