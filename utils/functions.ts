import type { NextRequest } from "next/server";
import { z } from "zod";
import { NodeEnv } from "./enums";

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
/**
 * Reads and validates BCRYPT_HASH_ROUNDS from the environment.
 *
 *
 * @returns the validated bcrypt cost factor.
 */
export const getBcryptHashRoundsFromEnv = (): number => {
  const rounds = Number(process.env.BCRYPT_HASH_ROUNDS);

  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 31)
    throw new Error("BCRYPT_HASH_ROUNDS must be an integer between 4 and 31");

  return rounds;
};
/**
 * Reads and validates EMAIL_SERVER_PORT from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated SMTP port.
 */
export const getEmailServerPortFromEnv = (): number => {
  const port = Number(process.env.EMAIL_SERVER_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("EMAIL_SERVER_PORT must be an integer between 1 and 65535");

  return port;
};
/**
 * Reads and validates EMAIL_SERVER_HOST from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated SMTP host.
 */
export const getEmailServerHostFromEnv = (): string => {
  const host = process.env.EMAIL_SERVER_HOST;

  if (!host) throw new Error("EMAIL_SERVER_HOST must be set");

  return host;
};
/**
 * Reads and validates EMAIL_SERVER_AUTH_USER from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated SMTP auth user.
 */
export const getEmailServerAuthUserFromEnv = (): string => {
  const user = process.env.EMAIL_SERVER_AUTH_USER;

  if (!user) throw new Error("EMAIL_SERVER_AUTH_USER must be set");

  return user;
};
/**
 * Reads and validates EMAIL_SERVER_AUTH_CLIENT_ID from the environment.
 * @throws {Error} if input is invalid
 * @returns the validated OAuth2 client id.
 */
export const getEmailServerAuthClientIdFromEnv = (): string => {
  const clientId = process.env.EMAIL_SERVER_AUTH_CLIENT_ID;

  if (!clientId) throw new Error("EMAIL_SERVER_AUTH_CLIENT_ID must be set");

  return clientId;
};
/**
 * Reads and validates EMAIL_SERVER_AUTH_CLIENT_SECRET from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated OAuth2 client secret.
 */
export const getEmailServerAuthClientSecretFromEnv = (): string => {
  const clientSecret = process.env.EMAIL_SERVER_AUTH_CLIENT_SECRET;

  if (!clientSecret)
    throw new Error("EMAIL_SERVER_AUTH_CLIENT_SECRET must be set");

  return clientSecret;
};
/**
 * Reads and validates EMAIL_SERVER_AUTH_REFRESH_TOKEN from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated OAuth2 refresh token.
 */
export const getEmailServerAuthRefreshTokenFromEnv = (): string => {
  const refreshToken = process.env.EMAIL_SERVER_AUTH_REFRESH_TOKEN;

  if (!refreshToken)
    throw new Error("EMAIL_SERVER_AUTH_REFRESH_TOKEN must be set");

  return refreshToken;
};
/**
 * Reads and validates EMAIL_FROM from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated "from" address used on outgoing emails.
 */
export const getEmailFromFromEnv = (): string => {
  const from = process.env.EMAIL_FROM;

  if (!from) throw new Error("EMAIL_FROM must be set");

  return from;
};
/**
 * Reads and validates NEXT_PUBLIC_URL from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated base URL.
 */
export const getNextPublicUrlFromEnv = (): string => {
  const url = process.env.NEXT_PUBLIC_URL;

  if (!url) throw new Error("NEXT_PUBLIC_URL must be set");

  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_URL must be a valid URL");
  }

  return url;
};
/**
 * Reads and validates NEXT_PUBLIC_AXIOS_BASEPATH from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated axios base path.
 */
export const getNextPublicAxiosBasepathFromEnv = (): string => {
  const basepath = process.env.NEXT_PUBLIC_AXIOS_BASEPATH;

  if (!basepath) throw new Error("NEXT_PUBLIC_AXIOS_BASEPATH must be set");

  return basepath;
};
/**
 * Reads and validates AUTH_BASEPATH from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated auth base path.
 */
export const getAuthBasepathFromEnv = (): string => {
  const basepath = process.env.AUTH_BASEPATH;

  if (!basepath) throw new Error("AUTH_BASEPATH must be set");

  return basepath;
};
/**
 * Reads EMAIL_SERVER_SECURE from the environment.
 *
 * @returns whether the SMTP connection should use TLS.
 */
export const getEmailServerSecureFromEnv = (): boolean => {
  return process.env.EMAIL_SERVER_SECURE === "true";
};
/**
 * Reads AUTH_ALLOW_GITHUB_DANGEROUS_EMAIL_ACCOUNT_LINKING from the environment.
 *
 * @returns whether a GitHub sign-in may link to an existing account with the same email.
 */
export const getAuthAllowGithubDangerousEmailAccountLinkingFromEnv =
  (): boolean => {
    return (
      process.env.AUTH_ALLOW_GITHUB_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true"
    );
  };
/**
 * Reads AUTH_ALLOW_GOOGLE_DANGEROUS_EMAIL_ACCOUNT_LINKING from the environment.
 *
 * @returns whether a Google sign-in may link to an existing account with the same email.
 */
export const getAuthAllowGoogleDangerousEmailAccountLinkingFromEnv =
  (): boolean => {
    return (
      process.env.AUTH_ALLOW_GOOGLE_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true"
    );
  };
/**
 * Reads and validates REDIS_URL from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the configured Redis connection URL, or undefined to use the package's own default.
 */
export const getRedisUrlFromEnv = (): string | undefined => {
  const url = process.env.REDIS_URL;

  if (!url) return undefined;

  try {
    new URL(url);
  } catch {
    throw new Error("REDIS_URL must be a valid URL");
  }

  return url;
};
/**
 * Reads and validates NODE_ENV from the environment.
 *
 * @throws {Error} if input is invalid
 * @returns the validated Node/Next environment.
 */
export const getNodeEnvFromEnv = (): NodeEnv => {
  const nodeEnv = process.env.NODE_ENV;

  if (!Object.values(NodeEnv).includes(nodeEnv as NodeEnv))
    throw new Error(
      `NODE_ENV must be one of: ${Object.values(NodeEnv).join(", ")}`,
    );

  return nodeEnv as NodeEnv;
};
