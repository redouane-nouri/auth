import { StatusCodes } from "http-status-codes";
import { LanguageCode } from "@/utils/enums";
import { isRateLimited } from "../../../../../../../lib/rateLimiter/rateLimiter";
import arMessages from "../../../../../../../messages/ar.json";
import { translationsObject } from "../../../../../../../utils/constants";
import { createMockRequest } from "../../../../../../../utils/functions";
import { POST as postForgotPasswordHandler } from "../route";
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
  Mocking the rate limiter so these tests don't need a real Redis connection, isRateLimited resolving to false means "not rate limited".
*/
jest.mock("../../../../../../../lib/rateLimiter/rateLimiter", () => ({
  isRateLimited: jest.fn(async () => false),
}));
/*
  Mocking the NextRequest and NextResponse imports in our POST API endpoint to prevent this error: ReferenceError: Request is not defined for NextRequest and Cannot read properties of undefined for NextResponse.
  Also mock implemetation of the NextResponse so the api can provide us the data and status and also we can extrect them for tests.
  Also mocking `after` as a no-op, so the fire-and-forget email sending never actually runs, these tests only care about what the route itself responds with.
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
  after: jest.fn(),
}));
/*
  Testing
*/
describe("POST - Forgot Password API", () => {
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
      const t = translationsObject.getMessages().forgotPasswordValidation;
      /*
        A request from a rate limited IP should return a 429 status and a too many requests error message, checked before anything else so the body doesn't matter here.
      */
      (isRateLimited as jest.Mock).mockResolvedValueOnce(true);
      let response = await postForgotPasswordHandler(createMockRequest({}));
      let { error } = await response.json();

      expect(response.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
      expect(error).toBe(t.tooManyRequests);
      /*
        A request with no body should return a 500 status and a JSON body containing a property named error, with the value being the error message from the forgotPasswordValidation namespace in the i18n messages JSON file chosen.
        The try catch block is returning this error.
      */
      response = await postForgotPasswordHandler(createMockRequest(undefined));
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(error).toBe(t.error);
      /*
        A request with an empty body should return a 400 status and erros for each attribute.
        An extra attribute should trigger also an error message in the global "_errors" parameter.
      */
      response = await postForgotPasswordHandler(
        createMockRequest({ invalidAttribute: "any" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error._errors).toContain(t.validAttributes);
      expect(error.email._errors).toContain(t.emailString);
      /*
        An empty email should trigger the invalid email format error message.
      */
      response = await postForgotPasswordHandler(
        createMockRequest({ email: "" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error.email._errors).toContain(t.emailInvalid);
      /*
        A valid attribute with length > 60 should trigger the max length error.
      */
      const longString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      response = await postForgotPasswordHandler(
        createMockRequest({ email: longString }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(error.email._errors).toContain(t.emailMax);
      /*
        A request with a rate limited email should return a 429 status and a too many requests error message.
      */
      (isRateLimited as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      response = await postForgotPasswordHandler(
        createMockRequest({ email: "valid@mail.test" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
      expect(error).toBe(t.tooManyRequests);
      /*
        A valid email should always return a 200 status and the generic success message, whether or not the email is actually registered, to avoid leaking who has an account.
      */
      response = await postForgotPasswordHandler(
        createMockRequest({ email: "valid@mail.test" }),
      );
      const { message } = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(message).toBe(t.success);
    },
  );
});
