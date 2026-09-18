import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageCode, ThemeAppearance } from "@/utils/enums";
import ThemeAndHeader from "../ThemeAndHeader";

/*
  Mocking Header so this stays a unit test
*/
jest.mock("../Header", () => ({
  appearance,
  setAppearance,
  initialLocale,
}: {
  appearance: string;
  setAppearance: (appearance: string) => void;
  initialLocale: string;
}) => (
  <div
    data-testid="header"
    data-appearance={appearance}
    data-initial-locale={initialLocale}
  >
    <button
      data-testid="flipAppearance"
      onClick={() => setAppearance(ThemeAppearance.DARK)}
    />
  </div>
));

describe("Theme And Header", () => {
  /*
    Should pass the initial appearance and locale down to Header, and render the children.
  */
  it("Should render Header with the initial appearance/locale, and the children", () => {
    /*
      Arrange
    */
    render(
      <ThemeAndHeader
        themeAppearance={ThemeAppearance.LIGHT}
        initialLocale={LanguageCode.ES}
      >
        <div data-testid="children">Content</div>
      </ThemeAndHeader>,
    );
    /*
      Assert Header received the right props and the children are rendered.
    */
    const header = screen.getByTestId("header");
    expect(header).toHaveAttribute("data-appearance", ThemeAppearance.LIGHT);
    expect(header).toHaveAttribute("data-initial-locale", LanguageCode.ES);
    expect(screen.getByTestId("children")).toHaveTextContent("Content");
  });
  /*
    Should update the appearance passed to Header when Header calls setAppearance.
  */
  it("Should update the appearance state when Header requests a change", async () => {
    /*
      Arrange
    */
    render(
      <ThemeAndHeader
        themeAppearance={ThemeAppearance.LIGHT}
        initialLocale={LanguageCode.EN}
      >
        <div />
      </ThemeAndHeader>,
    );
    /*
      Act by triggering the appearance change Header would request
    */
    await userEvent.click(screen.getByTestId("flipAppearance"));
    /*
      Assert Header is re-rendered with the new appearance.
    */
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-appearance",
      ThemeAppearance.DARK,
    );
  });
});
