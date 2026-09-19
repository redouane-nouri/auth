import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import SigninCard from "../SigninCard";
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
  Mocking the three sections SigninCard composes, so this stays a unit test. Named function
  declarations, not consts: they're hoisted (name and body both), so they're safe to reference from
  jest.mock() below, which itself gets hoisted above everything else in this file.
*/
function MockSigninWithCredentialsForm() {
  return <div data-testid="credentialsForm" />;
}
jest.mock("../SigninWithCredentialsForm", () => MockSigninWithCredentialsForm);

function MockSigninWithEmailForm() {
  return <div data-testid="emailForm" />;
}
jest.mock("../SigninWithEmailForm", () => MockSigninWithEmailForm);

function MockSigninWithOAuthSection() {
  return <div data-testid="oauthSection" />;
}
jest.mock("../SigninWithOAuthSection", () => MockSigninWithOAuthSection);

describe("Signin Card", () => {
  /*
    Should render the three sections and the correct translated text in every language.
  */
  it.each(Object.values(LanguageCode))(
    "Should render the composed sections and translated text in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinCard;
      /*
        Arrange
      */
      const { container } = render(
        <SigninCard switchToSignup={() => { }} />,
      );
      /*
        Assert that the three sections and the correct translated text are displayed.
      */
      expect(screen.getByTestId("credentialsForm")).toBeInTheDocument();
      expect(screen.getByTestId("emailForm")).toBeInTheDocument();
      expect(screen.getByTestId("oauthSection")).toBeInTheDocument();
      expect(container).toHaveTextContent(t.noAccount);
      expect(screen.getAllByText(t.orSeparator)).toHaveLength(2);
      expect(screen.getByTestId("switchToSignupButton")).toHaveTextContent(
        t.signUpNow,
      );
    },
  );
  /*
    To check switching to signup page works from the "Don't have an account? Sign up now!" message
  */
  it("Should switch to signup page", async () => {
    const switchToSignup = jest.fn();
    /*
      Arrange
    */
    render(<SigninCard switchToSignup={switchToSignup} />);
    /*
      Act by clicking on the switch to signup message
    */
    await userEvent.click(screen.getByTestId("switchToSignupButton"));
    /*
      Assert function has been called
    */
    expect(switchToSignup).toHaveBeenCalledTimes(1);
  });
});
