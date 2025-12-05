import arMessages from "../messages/ar.json";
import enMessages from "../messages/en.json";
import esMessages from "../messages/es.json";
import ruMessages from "../messages/ru.json";
import zhMessages from "../messages/zh.json";
import { LanguageCode } from "./enums";
/*
 This class is used to simulate the next-intl i18n in Jest tests to ensure using the correct language in each test.
*/
export class Translation {
  /*
   Proerty holds the current language used. initailez to prevent initializing error hilighting.
  */
  currentLanguage = LanguageCode.AR;
  /**
   * To switch the current language used in the test.
   * @param {LanguageCode} currentLanguage - language enum value.
   */
  setCurrentLanguage(currentLanguage: LanguageCode) {
    this.currentLanguage = currentLanguage;
  }
  /**
   * Gets a messages json file for the currentLanguage choosen.
   * @returns A json file that has the messages with the language choosen
   */
  getMessages(): typeof arMessages {
    switch (this.currentLanguage) {
      case LanguageCode.AR:
        return arMessages;

      case LanguageCode.EN:
        return enMessages;

      case LanguageCode.ES:
        return esMessages;

      case LanguageCode.RU:
        return ruMessages;

      default:
        return zhMessages;
    }
  }
  /**
   * Simulates the useTranslations & getTranslations next-intl method.
   * @param {keyof typeof arMessages} nameSpace - the name space to use inside the messages json file.
   * @returns The name space json object that holds the i18n message.
   */
  translationsMock(nameSpace: keyof typeof arMessages) {
    const translations = <
      K extends keyof (typeof arMessages)[typeof nameSpace],
    >(
      key: K,
    ): (typeof arMessages)[typeof nameSpace][K] | undefined => {
      return this.getMessages()[nameSpace][key];
    };

    return translations;
  }
}
