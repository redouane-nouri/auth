import { LanguageCode } from "@/utils/enums";
import prisma from "../../../../../../lib/prisma/prismaClient";
import arMessages from "../../../../../../messages/ar.json";
import { Translation } from "../../../../../../utils/classes";
import { POST as postSignupHandler } from "../../signup/route";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translationsObject = new Translation();
jest.mock("bcrypt", () => ({
  hash: jest.fn(async () => "hashedPassword"),
}));
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
  Mocking the prisma client to control the 'fundUnique' and 'create' frunction return values. 
*/
jest.mock("../../../../../../lib/prisma/prismaClient", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));
/*
  Mocking the NextRequest and NextResponse imports in our POST API endpoint to prevent this error: ReferenceError: Request is not defined for NextRequest and Cannot read properties of undefined for NextResponse.
  Also mock implemetation of the NextResponse so the api can provide us the data and status and also we can extrect them for tests.
*/
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: any, options: any) => {
      return {
        status: options.status,
        json: async () => body,
      };
    }),
  },
}));
/*
  A helper function to create a mock body for the request.
*/
const createMockRequest = (body: any): any => {
  return body ? { json: async () => body } : undefined;
};
/*
  Testing
*/
describe("POST - Singup API", () => {
  /*
    Testing the API with all the valid languages.
  */
  it.each(Object.values(LanguageCode))(
    "should respond with the correct status, errors, and success message in %s language for all the use cases",
    async (languageValueEnum) => {
      /*
       Changing the current language to the one choosen in the test.
      */
      translationsObject.setCurrentLanguage(
        languageValueEnum as LanguageCode,
      );
      const t = translationsObject.getMessages().signupValidation;
      /*
        A request with no body should return a 500 status and a JSON body containing a property named error, with the value being the error message from the signupValidation namespace in the i18n messages JSON file chosen.
        The try catch block is returning this error.
      */
      let response = await postSignupHandler(createMockRequest(undefined));
      let { error } = await response.json();

      expect(response.status).toBe(500);
      expect(error).toBe(t.error);
      /*
        A request with an empty body should return a 400 status and erros for each attribute.
        An extra attribute should trigger also an error message in the global "_errors" parameter.
      */
      response = await postSignupHandler(
        createMockRequest({ invalidAttribute: "any" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error._errors).toContain(t.validAttributes);
      expect(error.username._errors).toContain(t.usernameString);
      expect(error.password._errors).toContain(t.passwordString);
      expect(error.confirmPassword._errors).toContain(
        t.confirmPasswordString,
      );
      /*
        Attributes with 0 length should trigger all zod constraints except the max constraint error message.
      */
      response = await postSignupHandler(
        createMockRequest({
          username: "",
          password: "",
          confirmPassword: "",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.username._errors).toEqual([
        t.usernameMin,
        t.usernameRegex,
      ]);
      expect(error.password._errors).toEqual([
        t.passwordMin,
        t.passwordRegexLowercase,
        t.passwordRegexUppercase,
        t.passwordRegexNumber,
        t.passwordSpecialCharacter,
      ]);
      /*
        Valid attributes with length > 30 should trigger the max length error.
      */
      response = await postSignupHandler(
        createMockRequest({
          username: "abcdefghijklmnopqrstuvwxyz0123456789",
          password: "abcdefghijklmnopqrstuvwxyz0123456789",
          confirmPassword: "any",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.username._errors).toContain(t.usernameMax);
      expect(error.password._errors).toContain(t.passwordMax);
      /*
        Should check password matching and return an error message that the passwords does not match with 400 status.
      */
      response = await postSignupHandler(
        createMockRequest({
          username: "valid",
          password: "Password@123",
          confirmPassword: "notMatching",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.confirmPassword._errors).toContain(t.passwordsDontMatch);
      /*
        We have mock the finUnique to return an existing user, the API should retrun 409 status and an error message that the username exists.
      */
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        username: "usernameExists",
      });

      response = await postSignupHandler(
        createMockRequest({
          username: "usernameExists",
          password: "Password@123",
          confirmPassword: "Password@123",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(409);
      expect(error).toBe(t.usernameExists);
      /*
        Should return a 500 status and an error message when the username is valid and available to use but the creation failed.
      */
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      (prisma.user.create as jest.Mock).mockResolvedValue(undefined);
      response = await postSignupHandler(
        createMockRequest({
          username: "usernameDoesNotExist",
          password: "Password@123",
          confirmPassword: "Password@123",
        }),
      );
      ({ error } = await response.json());
      expect(response.status).toBe(500);
      expect(error).toBe(t.error);
      /*
        A success creation should return a 201 status and a success message.
        We didn't mock the findUnique because it is already mocked above to return undefined which mean the username is available to use.
      */
      (prisma.user.create as jest.Mock).mockResolvedValue({
        username: "username",
      });
      response = await postSignupHandler(
        createMockRequest({
          username: "username",
          password: "Password@123",
          confirmPassword: "Password@123",
        }),
      );
      let { message } = await response.json();
      expect(response.status).toBe(201);
      expect(message).toBe(t.success);
    },
  );
});
