import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { LanguageCode } from "@/utils/enums";
import Connect from "../Connect";
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
  Mocking SigninCard and SignupCard so this stays a unit test of Connect's own logic. Named function
  declarations, not consts: they're hoisted (name and body both), so they're safe to reference from
  jest.mock() below, which itself gets hoisted above everything else in this file.
*/
function MockSigninCard({ switchToSignup }: { switchToSignup: () => void }) {
  return (
    <div data-testid="signinCard">
      <button data-testid="goToSignup" onClick={switchToSignup} />
    </div>
  );
}
jest.mock("../../signin/SigninCard", () => MockSigninCard);

function MockSignupCard({ switchToSignin }: { switchToSignin: () => void }) {
  return (
    <div data-testid="signupCard">
      <button data-testid="goToSignin" onClick={switchToSignin} />
    </div>
  );
}
jest.mock("../../signup/SignupCard", () => MockSignupCard);
describe("Connect", () => {
  /*
    Should default to the login tab, showing the signin card and the translated tab labels.
  */
  it.each(Object.values(LanguageCode))(
    "Should default to the login tab in %s language",
    (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().connect;
      /*
        Arrange
      */
      render(<Connect />);
      /*
        Assert the login tab is active with its translated label, and the signup tab is not shown.
      */
      expect(screen.getAllByText(t.logIn)[0]).toBeInTheDocument();
      expect(screen.getAllByText(t.signUp)[0]).toBeInTheDocument();
      expect(screen.getByTestId("signinCard")).toBeInTheDocument();
      expect(screen.queryByTestId("signupCard")).not.toBeInTheDocument();
    },
  );
  /*
    Clicking the signup tab trigger should switch to the signup card.
  */
  it("Should switch to the signup tab when its trigger is clicked", async () => {
    const t = translationsObject.getMessages().connect;
    /*
      Arrange
    */
    render(<Connect />);
    /*
      Act by clicking on the signup tab trigger
    */
    await userEvent.click(screen.getAllByText(t.signUp)[0]);
    /*
      Assert the signup card is shown and the signin card is not.
    */
    expect(screen.getByTestId("signupCard")).toBeInTheDocument();
    expect(screen.queryByTestId("signinCard")).not.toBeInTheDocument();
  });
  /*
    The signin card's own switchToSignup callback should also switch to the signup tab.
  */
  it("Should switch to the signup tab when the signin card requests it", async () => {
    /*
      Arrange
    */
    render(<Connect />);
    /*
      Act by clicking the button standing in for the signin card's own "sign up now" link
    */
    await userEvent.click(screen.getByTestId("goToSignup"));
    /*
      Assert the signup card is shown and the signin card is not.
    */
    expect(screen.getByTestId("signupCard")).toBeInTheDocument();
    expect(screen.queryByTestId("signinCard")).not.toBeInTheDocument();
  });
  /*
    The signup card's own switchToSignin callback should switch back to the login tab.
  */
  it("Should switch back to the login tab when the signup card requests it", async () => {
    const t = translationsObject.getMessages().connect;
    /*
      Arrange
    */
    render(<Connect />);
    await userEvent.click(screen.getAllByText(t.signUp)[0]);
    /*
      Act by clicking the button standing in for the signup card's own "sign in now" link
    */
    await userEvent.click(screen.getByTestId("goToSignin"));
    /*
      Assert the signin card is shown and the signup card is not.
    */
    expect(screen.getByTestId("signinCard")).toBeInTheDocument();
    expect(screen.queryByTestId("signupCard")).not.toBeInTheDocument();
  });
});
