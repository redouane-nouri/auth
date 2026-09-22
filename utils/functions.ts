import type { NextRequest } from "next/server";
import { z } from "zod";

/**
 * Gets signup zod validation schema
 * @param t - next-int messages function, used for showing i18n errors.
 * @returns zod schema
 */
export const getSignupSchema = (t: (key: string) => string) => {
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
export const getSignInWithCredentialsSchema = (t: (key: string) => string) => {
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
export const getSignInWithEmailSchema = (t: (key: string) => string) => {
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
export const getForgotPasswordSchema = (t: (key: string) => string) => {
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
export const getResetPasswordSchema = (t: (key: string) => string) => {
  return z
    .object({
      token: z
        .string({ message: t("tokenString") })
        .trim()
        .min(1, t("tokenRequired")),
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
 * WARNING: this trusts `x-forwarded-for`/`x-real-ip` as-is, and takes the first entry of
 * `x-forwarded-for`, which is the end of the chain a client can freely set. That's only safe
 * if whatever reverse proxy sits in front of this app overwrites that header with the real
 * connecting IP (not append to whatever the client sent), and the app isn't reachable except
 * through that proxy. Otherwise this is spoofable and used to bypass the IP based rate limiters.
 *
 * Adjust which entry is read here (e.g. the last entry, or skip known trusted proxy hops) to match
 * whatever proxy is actually deployed in front.
 *
 * @param request - the incoming request.
 * @returns the client's IP address, or an "unknown:<user-agent>" fallback if it can't be determined.
 */
export const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  /*
    `x-forwarded-for` can hold a comma separated list of IPs (client, then each proxy it passed through), the client's IP is the first one.
  */
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  /*
    Neither header is set, which only happens when this app is reachable without a reverse proxy/load
    balancer in front setting one of them. Deploying behind one is the actual fix for that, this is
    just a fallback. 
  */
  const userAgent = request.headers.get("user-agent");
  return userAgent ? `unknown:${userAgent}` : "unknown";
};
/**
 * Creates a mock body for the request, used in jest API route tests. Includes empty headers since
 * some routes read them to key the rate limiter.
 *
 * @param body - the request body `.json()` should resolve to, or undefined to simulate a request with no body.
 * @returns an object shaped enough to stand in for a NextRequest in tests.
 */
export const createMockRequest = (body: unknown): NextRequest => {
  return (
    body ? { json: async () => body, headers: new Headers() } : undefined
  ) as NextRequest;
};
