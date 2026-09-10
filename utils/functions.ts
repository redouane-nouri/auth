import { z } from "zod";

/**
 * Gets signup zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getSignupSchema = (t: any) => {
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
 * Gets the signin with credentials zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getSignInWithCredentialsSchema = (t: any) => {
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

/**
 * Gets the signin with email zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getSignInWithEmailSchema = (t: any) => {
  return z
    .object({
      email: z
        .string({ message: t("emailString") })
        .trim()
        .max(60, t("emailMax"))
        .email(t("emailInvalid"))
        .toLowerCase(),
    })
    .strict(t("validAttributes"));
};
/**
 * Gets reset password zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getForgotPasswordSchema = (t: any) => {
  return z
    .object({
      email: z
        .string({ message: t("emailString") })
        .trim()
        .max(60, t("emailMax"))
        .email(t("emailInvalid"))
        .toLowerCase(),
    })
    .strict(t("validAttributes"));
};
/**
 * Gets reset password zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getResetPasswordSchema = (t: any) => {
  return z
    .object({
      token: z.string({ message: t("tokenString") }).min(1, t("tokenRequired")),
      password: z
        .string({ message: t("passwordString") })
        .min(8, t("passwordMin"))
        .max(60, t("passwordMax"))
        .regex(/[a-z]/, t("passwordRegexLowercase"))
        .regex(/[A-Z]/, t("passwordRegexUppercase"))
        .regex(/[0-9]/, t("passwordRegexNumber"))
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
 * Gets the client IP address from the request.
 *
 * @param request - the incoming request.
 * @returns the client's IP address, or "unknown" if it can't be determined.
 */
export const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  /*
    `x-forwarded-for` can hold a comma separated list of IPs (client, then each proxy it passed through), the client's IP is the first one.
  */
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
};
