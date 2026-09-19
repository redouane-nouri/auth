import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { encode } from "next-auth/jwt";
import { createTransport } from "nodemailer";
import { LanguageCode } from "@/utils/enums";
import prisma from "../../prisma/prisma-client";
import { isRateLimited } from "../../rateLimiter/rateLimiter";
import {
  getCachedSessionAndUser,
  invalidateCachedSession,
  setCachedSessionAndUser,
} from "../../redis/sessionCache";
import {
  auth,
  authorizeCredentials,
  encodeSessionToken,
  jwtCallback,
  prismaAdapter,
  sendVerificationRequest,
} from "../auth";
import arMessages from "../../../messages/ar.json";
import {
  AUTH_CREDENTIALS_PROVIDER_NAME,
  AUTH_GITHUB_PROVIDER_NAME,
  translationsObject,
} from "../../../utils/constants";
/*
  Mocking bcrypt so tests don't need real hashing/comparison, `compare` resolving to false by default
  means "wrong password". `hashSync` is called once at module load to build the dummy password hash.
*/
jest.mock("bcrypt", () => ({
  compare: jest.fn(async () => false),
  hashSync: jest.fn(() => "dummy-hash"),
}));
/*
 Mocking the getTranslations function from next-intl/server to return the translations and the auth config will use them and also will not throw an error.
*/
jest.mock("next-intl/server", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translationsObject get initiated.
  */
  getTranslations: (nameSpace: keyof typeof arMessages) =>
    translationsObject.translationsMock(nameSpace),
}));
/*
  Mocking the rate limiter so these tests don't need a real Redis connection, isRateLimited resolving to false means "not rate limited".
*/
jest.mock("../../rateLimiter/rateLimiter", () => ({
  isRateLimited: jest.fn(async () => false),
}));
/*
  Mocking the prisma client to control the 'findUnique' and 'deleteMany' function return values.
*/
jest.mock("../../prisma/prisma-client", () => ({
  user: {
    findUnique: jest.fn(),
  },
  verificationToken: {
    deleteMany: jest.fn(),
  },
}));
/*
  Mocking the session cache so these tests don't need a real Redis connection.
*/
jest.mock("../../redis/sessionCache", () => ({
  getCachedSessionAndUser: jest.fn(),
  setCachedSessionAndUser: jest.fn(),
  invalidateCachedSession: jest.fn(),
}));
/*
  Mocking the prisma adapter package, so we can fully control what the DB-backed adapter methods
  (getSessionAndUser/updateSession/deleteSession/createSession) resolve to, without a real DB.
*/
jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createSession: jest.fn(),
  })),
}));
/*
  Mocking next-auth's own jwt encoding, used as the fallback for non-credentials (OAuth/email) sessions.
*/
jest.mock("next-auth/jwt", () => ({
  encode: jest.fn(async () => "default-encoded-jwt"),
}));
/*
  Mocking the whole next-auth package: NextAuth() itself is never exercised end-to-end in these
  tests, only the standalone functions this file extracts from its config.
*/
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(async () => null),
  })),
  CredentialsSignin: class CredentialsSignin extends Error {
    code!: string;
  },
}));
/*
  Mocking these provider factories since they're plain, side-effect-free config builders next-auth
  ships as ESM-only packages Jest can't parse without a transform; a passthrough is enough since
  none of these tests exercise the providers array itself, only the functions extracted from it.
*/
jest.mock("next-auth/providers/credentials", () =>
  jest.fn((config: object) => config),
);
jest.mock("next-auth/providers/nodemailer", () =>
  jest.fn((config: object) => config),
);
jest.mock("next-auth/providers/github", () =>
  jest.fn((config: object) => config),
);
jest.mock("next-auth/providers/google", () =>
  jest.fn((config: object) => config),
);
/*
  Mocking uuid: it's an ESM-only package Jest can't parse without a transform, and mocking it also
  gives encodeSessionToken tests a deterministic session token to assert against.
*/
jest.mock("uuid", () => ({
  v4: jest.fn(() => "11111111-1111-1111-1111-111111111111"),
}));
/*
  Mocking email rendering
*/
jest.mock("@react-email/render", () => ({
  render: jest.fn(async () => "<html></html>"),
}));
/*
  Mocking nodemailer so sendVerificationRequest tests don't try to open a real SMTP connection.
*/
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(async () => ({
      rejected: [],
      pending: [],
      accepted: ["someone@mail.test"],
    })),
  })),
}));
/*
  To control the mock implementation of each mocked import as needed, instead of repeating the same
  cast inline every time it's used.
*/
const mockedPrismaAdapter = PrismaAdapter as jest.Mock;
const mockedAuth = auth as jest.Mock;
const mockedIsRateLimited = isRateLimited as jest.Mock;
const mockedGetCachedSessionAndUser = getCachedSessionAndUser as jest.Mock;
const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedCreateTransport = createTransport as jest.Mock;
const mockedBcryptCompare = bcrypt.compare as jest.Mock;
/*
  The fake object next-auth's real PrismaAdapter() would have returned, controlled directly since
  @auth/prisma-adapter is mocked above.
*/
const baseAdapter = mockedPrismaAdapter.mock.results[0]
  .value as Record<string, jest.Mock>;
/*
  A minimal stand-in for the raw Request next-auth passes to authorize()/sendVerificationRequest(),
  just enough for getClientIp() to read headers from it.
*/
const createAuthRequest = (): Request =>
  ({ headers: new Headers() }) as Request;

beforeEach(() => {
  jest.clearAllMocks();
  mockedAuth.mockResolvedValue(null);
});
/*
  Testing
*/
describe("jwtCallback", () => {
  it("tags the token as a credentials session when the account used the credentials provider", async () => {
    const token = await jwtCallback({
      token: {},
      account: { provider: AUTH_CREDENTIALS_PROVIDER_NAME },
    } as Parameters<typeof jwtCallback>[0]);

    expect(token?.credentials).toBe(true);
  });

  it("leaves the token untouched for any other provider", async () => {
    const token = await jwtCallback({
      token: {},
      account: { provider: AUTH_GITHUB_PROVIDER_NAME },
    } as Parameters<typeof jwtCallback>[0]);

    expect(token?.credentials).toBeUndefined();
  });
});

describe("encodeSessionToken", () => {
  const baseParams = { salt: "salt", secret: "secret" };

  it("delegates to the default next-auth jwt encoding for non-credentials sessions", async () => {
    const result = await encodeSessionToken({
      ...baseParams,
      token: { sub: "user-1" },
    });

    expect(encode).toHaveBeenCalled();
    expect(result).toBe("default-encoded-jwt");
  });

  it("throws when a credentials token has no user id", async () => {
    await expect(
      encodeSessionToken({ ...baseParams, token: { credentials: true } }),
    ).rejects.toThrow("User not found");
  });

  it("creates a DB session and returns its token for a credentials session", async () => {
    baseAdapter.createSession.mockResolvedValueOnce({
      sessionToken: "irrelevant",
      userId: "user-1",
      expires: new Date(),
    });

    const result = await encodeSessionToken({
      ...baseParams,
      token: { credentials: true, sub: "user-1" },
    });

    expect(baseAdapter.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
    );
    expect(typeof result).toBe("string");
  });

  it("throws when creating the DB session fails", async () => {
    baseAdapter.createSession.mockResolvedValueOnce(undefined);

    await expect(
      encodeSessionToken({
        ...baseParams,
        token: { credentials: true, sub: "user-1" },
      }),
    ).rejects.toThrow("Session creation failed");
  });
});

describe("prismaAdapter (cache wrapper)", () => {
  it("returns the cached session/user without touching the DB adapter on a cache hit", async () => {
    const cached = {
      session: { sessionToken: "tok", userId: "u1", expires: new Date() },
      user: { id: "u1", email: "u1@mail.test" },
    };
    mockedGetCachedSessionAndUser.mockResolvedValueOnce(cached);

    const result = await prismaAdapter.getSessionAndUser?.("tok");

    expect(result).toBe(cached);
    expect(baseAdapter.getSessionAndUser).not.toHaveBeenCalled();
  });

  it("falls back to the DB adapter and caches the result on a cache miss", async () => {
    const fromDb = {
      session: { sessionToken: "tok", userId: "u1", expires: new Date() },
      user: { id: "u1", email: "u1@mail.test" },
    };
    mockedGetCachedSessionAndUser.mockResolvedValueOnce(undefined);
    baseAdapter.getSessionAndUser.mockResolvedValueOnce(fromDb);

    const result = await prismaAdapter.getSessionAndUser?.("tok");

    expect(result).toBe(fromDb);
    expect(setCachedSessionAndUser).toHaveBeenCalledWith("tok", fromDb);
  });

  it("invalidates the cache after updating a session", async () => {
    await prismaAdapter.updateSession?.({
      sessionToken: "tok",
      expires: new Date(),
    });

    expect(baseAdapter.updateSession).toHaveBeenCalled();
    expect(invalidateCachedSession).toHaveBeenCalledWith("tok");
  });

  it("invalidates the cache after deleting a session", async () => {
    await prismaAdapter.deleteSession?.("tok");

    expect(baseAdapter.deleteSession).toHaveBeenCalledWith("tok");
    expect(invalidateCachedSession).toHaveBeenCalledWith("tok");
  });
});

describe("sendVerificationRequest", () => {
  const baseParams = {
    identifier: "user@mail.test",
    url: "https://example.test/verify?token=abc",
    expires: new Date(),
    token: "abc",
    theme: {},
    provider: { server: {}, from: "noreply@example.test" },
    request: createAuthRequest(),
  } as Parameters<NodemailerConfig["sendVerificationRequest"]>[0];

  /*
    One sequential test, since the module-level nodemailer transporter is a lazily created singleton
    shared across calls.
  */
  it("handles rate limiting, unregistered emails, sending, and provider failures", async () => {
    /*
      A rate limited IP or email should throw before ever looking up the user.
    */
    mockedIsRateLimited.mockResolvedValueOnce(true);
    await expect(sendVerificationRequest(baseParams)).rejects.toThrow(
      "Too many requests",
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    /*
      An unregistered email should silently delete the token and return, without sending anything.
    */
    mockedFindUnique.mockResolvedValueOnce(undefined);
    await expect(sendVerificationRequest(baseParams)).resolves.toBeUndefined();
    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: baseParams.identifier },
    });
    /*
      A registered user should get the sign-in email sent.
    */
    mockedFindUnique.mockResolvedValueOnce({
      email: baseParams.identifier,
    });
    await expect(sendVerificationRequest(baseParams)).resolves.toBeUndefined();
    const transporter = mockedCreateTransport.mock.results[0].value;
    expect(transporter.sendMail).toHaveBeenCalled();
    /*
      If the email provider rejects the message, that should throw.
    */
    mockedFindUnique.mockResolvedValueOnce({
      email: baseParams.identifier,
    });
    transporter.sendMail.mockResolvedValueOnce({
      rejected: [baseParams.identifier],
      pending: [],
      accepted: [],
    });
    await expect(sendVerificationRequest(baseParams)).rejects.toThrow(
      /could not be sent/,
    );
  });
});

describe("authorizeCredentials", () => {
  it.each(Object.values(LanguageCode))(
    "should respond with the correct error code and success data in %s language for all the use cases",
    async (languageValueEnum) => {
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().signinValidation;
      /*
        A request from a rate limited IP should throw with a too many requests error code.
      */
      mockedIsRateLimited.mockResolvedValueOnce(true);
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.tooManyRequests });
      /*
        An already signed in user should throw with an already signed in error code.
      */
      mockedAuth.mockResolvedValueOnce({ user: {} });
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.alreadySignedIn });
      /*
        Invalid credentials shape (failing zod validation) should throw with the generic error code.
      */
      await expect(
        authorizeCredentials({}, createAuthRequest()),
      ).rejects.toMatchObject({ code: t.error });
      /*
        A rate limited email, on top of a passing IP check, should throw with a too many requests error code.
      */
      mockedIsRateLimited
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.tooManyRequests });
      /*
        No matching user should throw with an invalid credentials error code, bcrypt.compare still
        runs against the dummy hash so the response time doesn't leak whether the email is registered.
      */
      mockedFindUnique.mockResolvedValueOnce(undefined);
      await expect(
        authorizeCredentials(
          { email: "missing@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.invalidCredentials });
      /*
        A user with no password set (an OAuth-only account) should throw with an invalid credentials error code.
      */
      mockedFindUnique.mockResolvedValueOnce({
        id: "user-1",
        email: "valid@mail.test",
        password: null,
      });
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.invalidCredentials });
      /*
        A wrong password should throw with an invalid credentials error code.
      */
      mockedFindUnique.mockResolvedValueOnce({
        id: "user-1",
        email: "valid@mail.test",
        password: "hashedPassword",
      });
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Wrong@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.invalidCredentials });
      /*
        The correct password should resolve with the user data, without the password field.
      */
      mockedFindUnique.mockResolvedValueOnce({
        id: "user-1",
        email: "valid@mail.test",
        name: "Valid",
        image: null,
        password: "hashedPassword",
      });
      mockedBcryptCompare.mockResolvedValueOnce(true);
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).resolves.toEqual({
        id: "user-1",
        email: "valid@mail.test",
        name: "Valid",
        image: null,
      });
      /*
        Any unexpected error (a failed DB lookup here) should still throw a generic error code.
      */
      mockedFindUnique.mockRejectedValueOnce(
        new Error("DB is down"),
      );
      await expect(
        authorizeCredentials(
          { email: "valid@mail.test", password: "Valid@123" },
          createAuthRequest(),
        ),
      ).rejects.toMatchObject({ code: t.error });
    },
  );
});
