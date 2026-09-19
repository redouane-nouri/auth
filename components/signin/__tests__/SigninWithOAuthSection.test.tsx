import { render, screen } from "@testing-library/react";
import { OAuth2ProviderAuthId } from "@/utils/enums";
import { OAuth2ProviderT } from "@/utils/types";
import SigninWithOAuthSection from "../SigninWithOAuthSection";
/*
  Mocking OAuth2Provider so this stays a unit test. A named function declaration, not a const: it's
  hoisted (name and body both), so it's safe to reference from jest.mock() below, which itself gets
  hoisted above everything else in this file, including a const's initializer.
*/
function MockOAuth2Provider({
  oAuth2Provider,
}: {
  oAuth2Provider: OAuth2ProviderT;
}) {
  return <div data-testid={`oAuth2Provider-${oAuth2Provider.id}`} />;
}
jest.mock("../OAuth2Provider", () => MockOAuth2Provider);

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
