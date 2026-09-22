import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useQueryClient } from "@tanstack/react-query";
import { LanguageCode, ThemeAppearance } from "@/utils/enums";
import ThemeAndHeader from "../ThemeAndHeader";

/*
  Captures every QueryClient MockHeader sees rendered under, across all tests - cleared in
  beforeEach, so each test only inspects what it captured itself.
*/
const capturedQueryClients: unknown[] = [];
/*
  Mocking Header so this stays a unit test. A named function declaration, not a const: it's hoisted
  (name and body both), so it's safe to reference from jest.mock() below, which itself gets hoisted
  above everything else in this file, including a const's initializer.
*/
function MockHeader({
  appearance,
  setAppearance,
  initialLocale,
}: {
  appearance: string;
  setAppearance: (appearance: string) => void;
  initialLocale: string;
}) {
  /*
    Header (real or mocked) is re-rendered fresh by ThemeAndHeader on every state change, unlike
    `children`, which React bails out of re-rendering since that element reference doesn't change -
    so this is where a QueryClient identity change would actually be observable.
  */
  capturedQueryClients.push(useQueryClient());

  return (
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
  );
}
jest.mock("../Header", () => MockHeader);

describe("Theme And Header", () => {
  beforeEach(() => {
    capturedQueryClients.length = 0;
  });

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

  /*
    Should keep the same QueryClient instance across an appearance change - a fresh one on every
    render would tear down the whole cache mid-request, so a form's in-flight mutation (isPending)
    could lose its success/error state if the user toggles the theme while it's running.
  */
  it("keeps the same QueryClient across an appearance change", async () => {
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
      Assert Header saw the exact same QueryClient instance both before and after.
    */
    expect(capturedQueryClients.length).toBeGreaterThanOrEqual(2);
    expect(capturedQueryClients[0]).toBe(
      capturedQueryClients[capturedQueryClients.length - 1],
    );
  });
});
