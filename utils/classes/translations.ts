import ar_messages from "../../messages/ar.json";
import en_messages from "../../messages/en.json";
import es_messages from "../../messages/es.json";
import ru_messages from "../../messages/ru.json";
import zh_messages from "../../messages/zh.json";
import { language_values_global_enum } from "../enums/global_enums";
/*
 This class is used to simulate the next-intl i18n in Jest tests to ensure using the correct language in each test.
*/
export class translations_class {
  /*
   Proerty holds the current language used. initailez to prevent initializing error hilighting.
  */
  current_language = language_values_global_enum.AR;
  /**
   * To switch the current language used in the test.
   * @param {language_values_global_enum} current_language - language enum value.
   */
  set_current_language(current_language: language_values_global_enum) {
    this.current_language = current_language;
  }
  /**
   * Gets a messages json file for the current_language choosen.
   * @returns A json file that has the messages with the language choosen
   */
  get_messages(): typeof ar_messages {
    switch (this.current_language) {
      case language_values_global_enum.AR:
        return ar_messages;

      case language_values_global_enum.EN:
        return en_messages;

      case language_values_global_enum.ES:
        return es_messages;

      case language_values_global_enum.RU:
        return ru_messages;

      default:
        return zh_messages;
    }
  }
  /**
   * Simulates the useTranslations & getTranslations next-intl method.
   * @param {keyof typeof ar_messages} name_space - the name space to use inside the messages json file.
   * @returns The name space json object that holds the i18n message.
   */
  translations_mock(name_space: keyof typeof ar_messages) {
    const translations = <
      K extends keyof (typeof ar_messages)[typeof name_space],
    >(
      key: K,
    ): (typeof ar_messages)[typeof name_space][K] | undefined => {
      return this.get_messages()[name_space][key];
    };

    return translations;
  }
}
