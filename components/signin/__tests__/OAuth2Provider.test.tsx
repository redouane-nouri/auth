import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { OAuth2ProviderT } from "@/utils/types";
import OAuth2Provider from "../OAuth2Provider";
/*
  Mocking next-auth/react's signIn
*/
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));
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
    Clicking the button should sign in with this provider's id and redirect to home.
  */
  it("Should sign in with the provider id when clicked", async () => {
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
      Assert signIn was called with this provider's id and the home callback url.
    */
    expect(signIn).toHaveBeenCalledWith(testProvider.id, {
      callbackUrl: "/",
    });
  });
});
