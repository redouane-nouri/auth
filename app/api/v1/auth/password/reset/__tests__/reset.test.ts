import { StatusCodes } from "http-status-codes";
import { LanguageCode } from "@/utils/enums";
import prisma from "../../../../../../../lib/prisma/prisma-client";
import { invalidateCachedSession } from "../../../../../../../lib/redis/sessionCache";
import { isRateLimited } from "../../../../../../../lib/rateLimiter/rateLimiter";
import arMessages from "../../../../../../../messages/ar.json";
import { translationsObject } from "../../../../../../../utils/constants";
import { createMockRequest } from "../../../../../../../utils/functions";
import { POST as postResetPasswordHandler } from "../route";
/*
 Mocking the getTranslations function from next-intl/server to return the translations and the api endpoint will use them and also will not throw an error.
*/
jest.mock("next-intl/server", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translationsObject get initiated.
  */
  getTranslations: (nameSpace: keyof typeof arMessages) =>
    translationsObject.translationsMock(nameSpace),
}));
/*
  Mocking the prisma client to control the 'verificationToken', 'user' and 'session' functions return values.
*/
jest.mock("../../../../../../../lib/prisma/prisma-client", () => ({
  verificationToken: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));
/*
  Mocking the session cache invalidation so these tests don't need a real Redis connection.
*/
jest.mock("../../../../../../../lib/redis/sessionCache", () => ({
  invalidateCachedSession: jest.fn(),
}));
/*
  Mocking the rate limiter so these tests don't need a real Redis connection, isRateLimited resolving to false means "not rate limited".
*/
jest.mock("../../../../../../../lib/rateLimiter/rateLimiter", () => ({
  isRateLimited: jest.fn(async () => false),
}));
/*
  Mocking the NextRequest and NextResponse imports in our POST API endpoint to prevent this error: ReferenceError: Request is not defined for NextRequest and Cannot read properties of undefined for NextResponse.
  Also mock implemetation of the NextResponse so the api can provide us the data and status and also we can extrect them for tests.
*/
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, options?: { status: number }) => {
      return {
        status: options?.status ?? StatusCodes.OK,
        json: async () => body,
      };
    }),
  },
}));
/*
  Testing
*/
describe("POST - Reset Password API", () => {
  /*
    Testing the API with all the valid languages.
  */
  it.each(Object.values(LanguageCode))(
    "should respond with the correct status, errors, and success message in %s language for all the use cases",
    async (languageValueEnum) => {
      /*
       Changing the current language to the one choosen in the test.
      */
      translationsObject.setCurrentLanguage(languageValueEnum as LanguageCode);
      const t = translationsObject.getMessages().resetPasswordValidation;
      /*
        A request from a rate limited IP should return a 429 status and a too many requests error message, checked before anything else so the body doesn't matter here.
      */
      (isRateLimited as jest.Mock).mockResolvedValueOnce(true);
      let response = await postResetPasswordHandler(createMockRequest({}));
      let { error } = await response.json();

      expect(response.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
      expect(error).toBe(t.tooManyRequests);
      /*
        A request with no body should return a 500 status and a JSON body containing a property named error, with the value being the error message from the resetPasswordValidation namespace in the i18n messages JSON file chosen.
        The try catch block is returning this error.
      */
      response = await postResetPasswordHandler(createMockRequest(undefined));
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(error).toBe(t.error);
      /*
        A request with an empty body should return a 400 status and erros for each attribute.
        An extra attribute should trigger also an error message in the global "_errors" parameter.
      */
      response = await postResetPasswordHandler(
        createMockRequest({ invalidAttribute: "any" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error._errors).toContain(t.validAttributes);
      expect(error.token._errors).toContain(t.tokenString);
      expect(error.password._errors).toContain(t.passwordString);
      expect(error.confirmPassword._errors).toContain(t.confirmPasswordString);
      /*
        Attributes with 0 length should trigger all zod constraints except the max constraint error message.
      */
      response = await postResetPasswordHandler(
        createMockRequest({ token: "", password: "", confirmPassword: "" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error.token._errors).toContain(t.tokenRequired);
      expect(error.password._errors).toEqual([
        t.passwordMin,
        t.passwordRegexLowercase,
        t.passwordRegexUppercase,
        t.passwordRegexNumber,
        t.passwordSpecialCharacter,
      ]);
      /*
        A valid password with length > 60 should trigger the max length error.
      */
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      response = await postResetPasswordHandler(
        createMockRequest({
          token: "valid-token",
          password: longString,
          confirmPassword: "any",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error.password._errors).toContain(t.passwordMax);
      /*
        Should check password matching and return an error message that the passwords does not match with 400 status.
      */
      response = await postResetPasswordHandler(
        createMockRequest({
          token: "valid-token",
          password: "Valid@123",
          confirmPassword: "notMatching",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error.confirmPassword._errors).toContain(t.passwordsDontMatch);
      /*
        An invalid or expired token should return a 400 status and a token invalid error message.
      */
      (
        prisma.verificationToken.findFirst as jest.Mock
      ).mockResolvedValueOnce(undefined);
      response = await postResetPasswordHandler(
        createMockRequest({
          token: "invalid-token",
          password: "Valid@123",
          confirmPassword: "Valid@123",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error).toBe(t.tokenInvalid);
      /*
        Should return a 500 status and an error message when the token is valid but updating the user's password failed.
      */
      (
        prisma.verificationToken.findFirst as jest.Mock
      ).mockResolvedValueOnce({
        identifier: "valid@mail.test",
        token: "hashed-token",
        expires: new Date(Date.now() + 1000 * 60 * 60),
      });
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(undefined);
      response = await postResetPasswordHandler(
        createMockRequest({
          token: "valid-token",
          password: "Valid@123",
          confirmPassword: "Valid@123",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(error).toBe(t.error);
      /*
        A successful reset should return a 200 status and a success message, and every existing session
        for that user should be revoked, both in the database and in the session cache.
      */
      (
        prisma.verificationToken.findFirst as jest.Mock
      ).mockResolvedValueOnce({
        identifier: "valid@mail.test",
        token: "hashed-token",
        expires: new Date(Date.now() + 1000 * 60 * 60),
      });
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        email: "valid@mail.test",
      });
      (prisma.session.findMany as jest.Mock).mockResolvedValueOnce([
        { sessionToken: "session-1" },
        { sessionToken: "session-2" },
      ]);
      response = await postResetPasswordHandler(
        createMockRequest({
          token: "valid-token",
          password: "Valid@123",
          confirmPassword: "Valid@123",
        }),
      );
      const { message } = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(message).toBe(t.success);
      expect(invalidateCachedSession).toHaveBeenCalledWith("session-1");
      expect(invalidateCachedSession).toHaveBeenCalledWith("session-2");
    },
  );
});
