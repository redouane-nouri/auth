import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import ar_messages from "../../../messages/ar.json";
import { Translation } from "../../../utils/classes/translations";
import { LanguageCode } from "../../../utils/enums/global";
import SignupCard from "../signup_card";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translations_object = new Translation();
/*
 Mocking the useTranslations function from next-intl to return the translations.
*/
jest.mock("next-intl", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translations_object get initiated.
  */
  useTranslations: (name_space: keyof typeof ar_messages) =>
    translations_object.translationsMock(name_space),
}));
/*
  Initial Mock Implemntation
*/
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    isError: false,
    isSuccess: false,
    isPending: false,
  })),
}));
/*
  To control the mock implementation of the mutation as needed.
*/
const { useMutation } = require("@tanstack/react-query");

describe("Signup Card", () => {
  /*
    Snapshot Testing that the Signup card is rendered with the correct language messages
  */
  it.each(Object.values(LanguageCode))(
    "Should render UI with %s language",
    (language_value_enum) => {
      /*
        Set the current language so mock useTranslation function will return the messages with the current language
      */
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      /*
        Arrange
      */
      const { container } = render(<SignupCard />);
      /*
        Assert
      */
      expect(container).toMatchSnapshot();
    },
  );
  /*
    A click on the signup button with empty data should display username and password hints
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password required hints in %s language",
    async (language_value_enum) => {
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      /*
        Get the messages with the current language to compare with.
      */
      const t = translations_object.getMessages().signup_validation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by clicking on the submit button
      */
      await userEvent.click(screen.getByTestId("submit_button"));
      /*
        Assert that username and password min message (required) is displayed with the correct language and place
      */
      expect(screen.getByTestId("username_hint_span")).toHaveTextContent(
        t.username_min,
      );
      expect(screen.getByTestId("password_hint_span")).toHaveTextContent(
        t.password_min,
      );
    },
  );
  /*
    A maximum error message should be displayed when the max length is exceeded (30 char)
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password max length is exceeded hints in %s language",
    async (language_value_enum) => {
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      const long_string =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting long string in username & password inputs.
      */
      await userEvent.type(screen.getByTestId("username_input"), long_string);
      await userEvent.type(screen.getByTestId("password_input"), long_string);
      await userEvent.click(screen.getByTestId("submit_button"));
      /*
        Assert that username and password max length message is displayed with the correct language and place.
      */
      expect(screen.getByTestId("username_hint_span")).toHaveTextContent(
        t.username_max,
      );
      expect(screen.getByTestId("password_hint_span")).toHaveTextContent(
        t.password_max,
      );
    },
  );
  /*
    A regex error message should be displayed when the regex is violated for username or password
  */
  it.each(Object.values(LanguageCode))(
    "Should display username and password regex hints in %s language",
    async (language_value_enum) => {
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting non valid regex for both username and password
      */
      const password_input = screen.getByTestId("password_input");
      const username_input = screen.getByTestId("username_input");
      await userEvent.type(username_input, "invalid#!@#");
      await userEvent.type(password_input, "lowercase");
      await userEvent.click(screen.getByTestId("submit_button"));
      const username_hint_span = screen.getByTestId("username_hint_span");
      const password_hint_span = screen.getByTestId("password_hint_span");
      /*
        Assert that username and password regex message is displayed with the correct language and place.
      */
      expect(username_hint_span).toHaveTextContent(t.username_regex);
      expect(password_hint_span).toHaveTextContent(t.password_regex_uppercase);
      /*
        Add uppercase letters
      */
      await userEvent.clear(password_input);
      await userEvent.type(password_input, "lowercaseUPPERCASE");
      expect(password_hint_span).toHaveTextContent(t.password_regex_number);
      /*
        Add numbers
      */
      await userEvent.clear(password_input);
      await userEvent.type(password_input, "lowercaseUPPERCASE123");
      expect(password_hint_span).toHaveTextContent(
        t.password_special_character,
      );
      /*
        respect the regex for username and password (by adding special chars for password), then expect to have not hint messages.
      */
      await userEvent.clear(username_input);
      await userEvent.clear(password_input);
      await userEvent.type(username_input, "username");
      await userEvent.type(password_input, "lowercaseUPPERCASE123!@#");
      expect(screen.queryByTestId("username_hint_span")).toBeNull();
      expect(screen.queryByTestId("password_hint_span")).toBeNull();
    },
  );
  /*
    A confirm password does not match should be displayed when password and confirm password are not equal
  */
  it.each(Object.values(LanguageCode))(
    "Should display confirm password does not match with password in %s language",
    async (language_value_enum) => {
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Act by inserting non equal passwords
      */
      await userEvent.type(screen.getByTestId("password_input"), "Password1@");
      await userEvent.type(
        screen.getByTestId("confirm_password_input"),
        "Password2@",
      );
      await userEvent.click(screen.getByTestId("submit_button"));
      /*
        Assert password does not match is displayed
      */
      expect(
        screen.getByTestId("confirm_password_hint_span"),
      ).toHaveTextContent(t.passwords_dont_match);
    },
  );
  /*
    Unexpected error is displayed correctly
  */
  it.each(Object.values(LanguageCode))(
    "Should display unexpected creation error message in %s language",
    async (language_value_enum) => {
      /*
        Mock to return an excpected error
      */
      useMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: "unexpected error.",
      }));
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      /*
        Arrange
      */
      render(<SignupCard />);
      /*
        Assert unexpected error is displayed.
      */
      expect(screen.getByTestId("error_badge")).toHaveTextContent(t.error);
    },
  );
  /*
    Mock isAxiosError to true to trigger axios error.
  */
  jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
  /*
    To check axios Error creation is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display axios error creation message in %s language",
    async (language_value_enum) => {
      /*
        Mock to return an axios error
      */
      useMutation.mockImplementation(() => ({
        isError: true,
        isSuccess: false,
        isPending: false,
        error: { response: { data: { error: "Axios error" } } },
      }));
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      /*
        Arrange.
      */
      render(<SignupCard />);
      /*
        Assert axios error is displayed.
      */
      expect(screen.getByTestId("error_badge")).toHaveTextContent(
        "Axios error",
      );
    },
  );
  /*
    To check success creation message is displayed correctly.
  */
  it.each(Object.values(LanguageCode))(
    "Should display success creation message in %s language",
    async (language_value_enum) => {
      translations_object.setCurrentLanguage(
        language_value_enum as LanguageCode,
      );
      const t = translations_object.getMessages().signup_validation;
      /*
        Mock to return an success creation message.
      */
      useMutation.mockImplementation(() => ({
        isError: false,
        isSuccess: true,
        isPending: false,
        data: { data: { message: t.success } },
      }));
      /*
        Arrange.
      */
      render(<SignupCard />);
      /*
        Assert success message is displayed.
      */
      expect(screen.getByTestId("success_badge")).toHaveTextContent(t.success);
    },
  );
});
