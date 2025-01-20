import { render, screen } from "@testing-library/react";
import ar_messages from "../../../messages/ar.json";
import { translations_class } from "../../../utils/classes/translations";
import { language_values_global_enum } from "../../../utils/enums/global_enums";
import SignupCard from "../signup_card";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translations_object = new translations_class();
/*
 Mocking the useTranslations function from next-intl to return the translations.
*/
jest.mock("next-intl", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translations_object get initiated.
  */
  useTranslations: (name_space: keyof typeof ar_messages) =>
    translations_object.translations_mock(name_space),
}));
/*
  Mock useMutation to prevent runtime error
*/
jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ isError: false, isSuccess: false, isPending: false }),
}));

describe("Signup Card", () => {
  /*
    Snapshot Testing that the Signup card is rendered with the correct language messages
  */
  it.each(Object.values(language_values_global_enum))(
    "Should render UI with %s language",
    (language_value_enum) => {
      /*
        Set the current language so mock useTranslation function will return the messages with the current language
      */
      translations_object.set_current_language(
        language_value_enum as language_values_global_enum,
      );
      /*
        Arrance
      */
      const { container } = render(<SignupCard />);
      /*
        Assert
      */
      expect(container).toMatchSnapshot();
    },
  );
});
