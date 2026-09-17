import { render, screen } from "@testing-library/react";
import { OAuth2ProviderAuthId } from "@/utils/enums";
import { OAuth2ProviderT } from "@/utils/types";
import SigninWithOAuthSection from "../SigninWithOAuthSection";
/*
  Mocking OAuth2Provider so this stays a unit test
*/
jest.mock("../OAuth2Provider", () => ({ oAuth2Provider }: { oAuth2Provider: OAuth2ProviderT }) => (
  <div data-testid={`oAuth2Provider-${oAuth2Provider.id}`} />),
);

describe("Signin With OAuth Section", () => {
  /*
    Should render one OAuth2Provider per configured provider.
  */
  it("Should render one OAuth2Provider per configured provider", () => {
    /*
      Arrange
    */
    render(<SigninWithOAuthSection />);
    /*
      Assert that a GitHub and a Google OAuth2Provider are both rendered.
    */
    expect(
      screen.getByTestId(`oAuth2Provider-${OAuth2ProviderAuthId.GITHUB}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`oAuth2Provider-${OAuth2ProviderAuthId.GOOGLE}`),
    ).toBeInTheDocument();
  });
});
