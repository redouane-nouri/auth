import { z } from "zod";

/**
 * Gets the user signup zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getUserSignupSchema = (t: any) => {
  return z
    .object({
      name: z
        .string({ message: t("nameString") })
        .trim()
        .min(1, t("nameRequired"))
        .max(60, t("nameMax")),
      email: z
        .string({ message: t("emailString") })
        .trim()
        .max(60, t("emailMax"))
        .email(t("emailInvalid"))
        .toLowerCase(),
      password: z
        .string({ message: t("passwordString") })
        .min(8, t("passwordMin"))
        .max(60, t("passwordMax"))
        .regex(/[a-z]/, t("passwordRegexLowercase"))
        .regex(/[A-Z]/, t("passwordRegexUppercase"))
        .regex(/[0-9]/, t("passwordRegexNumber"))
        /*
          1st Group [!-\/] Match ASCII code from 33 to 47: !"#$%&'()*+,-./
          2nd Group [:-@] Match ASCII code from 58 to 64: :;<=>?@
          3rd Group [[-`] Match ASCII code from 91 to 96: [\]^_`
          4th Group [{-~] Match ASCII code from 123 to 126: {|}~
        */
        .regex(/[!-\/:-@[-`{-~]/, t("passwordSpecialCharacter")),
      confirmPassword: z.string({ message: t("confirmPasswordString") }),
    })
    .strict(t("validAttributes"))
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
};

/**
 * Gets the user signin zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getUserSignInSchema = (t: any) => {
  return z
    .object({
      email: z
        .string({ message: t("emailString") })
        .trim()
        .max(60, t("emailMax"))
        .email(t("emailInvalid"))
        .toLowerCase(),
      password: z
        .string({ message: t("passwordString") })
        .min(8, t("passwordMin"))
        .max(60, t("passwordMax")),
    })
    .strict(t("validAttributes"));
};
