import { z } from "zod";

/**
 * Gets the user signup zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const get_user_signup_schema = (t: any) => {
  return z
    .object({
      username: z
        .string({ message: t("username_string") })
        .min(1, t("username_min"))
        .max(30, t("username_max"))
        .regex(/^[a-zA-Z0-9_-]+$/, t("username_regex")),
      password: z
        .string({ message: t("password_string") })
        .min(8, t("password_min"))
        .max(30, t("password_max"))
        .regex(/[a-z]/, t("password_regex_lowercase"))
        .regex(/[A-Z]/, t("password_regex_uppercase"))
        .regex(/[0-9]/, t("password_regex_number"))
        /*
          1st Group [!-\/] Match ASCII code from 33 to 47: !"#$%&'()*+,-./
          2nd Group [:-@] Match ASCII code from 58 to 64: :;<=>?@
          3rd Group [[-`] Match ASCII code from 91 to 96: [\]^_`
          4th Group [{-~] Match ASCII code from 123 to 126: {|}~
        */
        .regex(/[!-\/:-@[-`{-~]/, t("password_special_character")),
      confirm_password: z.string({ message: t("confirm_password_string") }),
    })
    .strict(t("valid_attributes"))
    .refine((data) => data.password === data.confirm_password, {
      message: t("passwords_dont_match"),
      path: ["confirm_password"],
    });
};
