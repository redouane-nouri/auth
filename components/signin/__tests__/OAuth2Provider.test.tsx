import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import arMessages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes";
import { OAuth2ProviderT } from "@/utils/types";
import OAuth2Provider from "../OAuth2Provider";
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
  Mocking next-auth/react's signIn
*/
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
/*
  Initial mock implementation
*/
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
  })),
}));
/*
  To control the mock implementation of each mocked import as needed
*/
const mockedUseMutation = useMutation as jest.Mock;
/*
  Fake provider to test with.
*/
const testProvider: OAuth2ProviderT = {
  id: "test-provider",
  label: "Test Provider",
  icon: () => <svg data-testid="providerIcon" />,
};

describe("OAuth2 Provider", () => {
  /*
    Should render the provider's label and icon.
  */
  it("Should render the provider label and icon", () => {
    /*
      Arrange
    */
    render(<OAuth2Provider oAuth2Provider={testProvider} />);
    /*
      Assert that the provider's label and icon are displayed.
    */
    expect(screen.getByText(testProvider.label)).toBeInTheDocument();
    expect(screen.getByTestId("providerIcon")).toBeInTheDocument();
  });
  /*
    Clicking the button should trigger the mutation, which signs in with this provider's id and
    redirects to home.
  */
  it("Should sign in with the provider id when clicked", async () => {
    let capturedMutationFn: () => unknown = () => undefined;
    const mockedMutate = jest.fn();
    mockedUseMutation.mockImplementationOnce((config) => {
      capturedMutationFn = config.mutationFn;
      return { mutate: mockedMutate, isPending: false, isError: false };
    });
    /*
      Arrange
    */
    render(<OAuth2Provider oAuth2Provider={testProvider} />);
    /*
      Act by clicking on the provider button
    */
    await userEvent.click(
      screen.getByTestId(`oAuth2ProviderButton-${testProvider.id}`),
    );
    /*
      Assert the mutation was triggered, and that its mutationFn calls signIn with this provider's
      id and the home callback url.
    */
    expect(mockedMutate).toHaveBeenCalledTimes(1);
    capturedMutationFn();
    expect(signIn).toHaveBeenCalledWith(testProvider.id, {
      callbackUrl: "/",
    });
  });
  /*
    While the sign-in attempt is pending, the button should show a loading state and be disabled,
    to prevent firing it again mid-flight.
  */
  it("Should show a loading state while signing in", () => {
    mockedUseMutation.mockImplementationOnce(() => ({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
    }));
    /*
      Arrange
    */
    render(<OAuth2Provider oAuth2Provider={testProvider} />);
    /*
      Assert the button is disabled while pending.
    */
    expect(
      screen.getByTestId(`oAuth2ProviderButton-${testProvider.id}`),
    ).toBeDisabled();
  });
  /*
    A failed sign-in attempt (e.g. a rejected signIn() promise) should surface visible feedback
    instead of being a silent, unhandled rejection.
  */
  it("Should display an error message when signing in fails", () => {
    const t = translationsObject.getMessages().signinCard;
    mockedUseMutation.mockImplementationOnce(() => ({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
    }));
    /*
      Arrange
    */
    render(<OAuth2Provider oAuth2Provider={testProvider} />);
    /*
      Assert the generic error message is displayed.
    */
    expect(
      screen.getByTestId(`oAuth2ProviderError-${testProvider.id}`),
    ).toHaveTextContent(t.error);
  });
});
