import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import SigninWithEmailForm from "../SigninWithEmailForm";
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
  Mocking next-auth/react's signIn since the real one needs a live NextAuth session/request context.
*/
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
/*
  To control the mock implementation of the mutation as needed.
*/
const mockedUseMutation = useMutation as jest.Mock;
const mockedSignIn = signIn as jest.Mock;

describe("Signin With Email Form", () => {
  /*
    Clicking the send login link button with empty data should display the email invalid hint
  */
  it.each(Object.values(LanguageCode))(
    "Should display email hint in %s language",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinValidation;
      /*
        Arrange
      */
      render(<SigninWithEmailForm />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("magicLinkSubmitButton"));
      /*
        Assert that the email invalid hint is displayed with the correct language and place
      */
      expect(screen.getByTestId("magicLinkEmailHint")).toHaveTextContent(
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
      const t = translationsObject.getMessages().signinValidation;
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<SigninWithEmailForm />);
      /*
        Act by inserting a long string in the email input.
      */
      await userEvent.type(
        screen.getByTestId("magicLinkEmailInput"),
        longString,
      );
      await userEvent.click(screen.getByTestId("magicLinkSubmitButton"));
      /*
        Assert that the email max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("magicLinkEmailHint")).toHaveTextContent(
        t.emailMax,
      );
    },
  );
  /*
    Unexpected error is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display error message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinCard;
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
      render(<SigninWithEmailForm />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByTestId("magicLinkErrorBadge")).toHaveTextContent(
        t.error,
      );
    },
  );
  /*
    To check the check-your-inbox success message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display check inbox success message in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinCard;
      /*
        Mock to return a success send.
      */
      mockedUseMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
      }));
      /*
        Arrange
      */
      render(<SigninWithEmailForm />);
      /*
        Assert check inbox success message is displayed.
      */
      expect(screen.getByTestId("magicLinkSuccessBadge")).toHaveTextContent(
        t.checkInbox,
      );
    },
  );
  /*
    When signIn() fails with a specific code (e.g. rate limited), that code should be surfaced as-is
    instead of always showing a generic error.
  */
  it("throws the specific code from signIn when there is one", async () => {
    let capturedMutationFn: (data: { email: string }) => Promise<void> = () =>
      Promise.resolve();
    mockedUseMutation.mockImplementationOnce((config) => {
      capturedMutationFn = config.mutationFn;
      return { isError: false, isSuccess: false, isPending: false };
    });
    mockedSignIn.mockResolvedValueOnce({
      ok: false,
      code: "Too many requests",
    });
    /*
      Arrange
    */
    render(<SigninWithEmailForm />);
    /*
      Act/Assert
    */
    await expect(
      capturedMutationFn({ email: "valid@mail.test" }),
    ).rejects.toThrow("Too many requests");
  });
  /*
    When signIn() fails without a specific code, the generic error message should be thrown.
  */
  it("throws the generic error message when signIn fails without a specific code", async () => {
    translationsObject.setCurrentLanguage(LanguageCode.EN);
    const t = translationsObject.getMessages().signinCard;
    let capturedMutationFn: (data: { email: string }) => Promise<void> = () =>
      Promise.resolve();
    mockedUseMutation.mockImplementationOnce((config) => {
      capturedMutationFn = config.mutationFn;
      return { isError: false, isSuccess: false, isPending: false };
    });
    mockedSignIn.mockResolvedValueOnce({ ok: false, error: "Configuration" });
    /*
      Arrange
    */
    render(<SigninWithEmailForm />);
    /*
      Act/Assert
    */
    await expect(
      capturedMutationFn({ email: "valid@mail.test" }),
    ).rejects.toThrow(t.error);
  });
});
