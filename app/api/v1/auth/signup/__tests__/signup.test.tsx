import { language_values_global_enum } from "@/utils/enums/global_enums";
import prisma from "../../../../../../lib/prisma/prisma_client";
import ar_messages from "../../../../../../messages/ar.json";
import { translations_class } from "../../../../../../utils/classes/translations";
import { POST as post_signup_handler } from "../../signup/route";
/*
  translation object will be used to provide translation for the i18n messages.
*/
const translations_object = new translations_class();
/*
 Mocking the getTranslations function from next-intl/server to return the translations and the api endpoint will use them and also will not throw an error.
*/
jest.mock("next-intl/server", () => ({
  /*
   using the lazy loading to avoid jest throwing an error because jest.mock run before the translations_object get initiated.
  */
  getTranslations: (name_space: keyof typeof ar_messages) =>
    translations_object.translations_mock(name_space),
}));
/*
  Mocking the prisma client to control the 'fundUnique' and 'create' frunction return values. 
*/
jest.mock("../../../../../../lib/prisma/prisma_client", () => ({
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
const create_mock_request = (body: any): any => {
  return body ? { json: async () => body } : undefined;
};
/*
  Testing
*/
describe("POST - Singup API", () => {
  /*
    Testing the API with all the valid languages.
  */
  it.each(Object.values(language_values_global_enum))(
    "should respond with the correct status, errors, and success message in %s language for all the use cases",
    async (language_value_enum) => {
      /*
       Changing the current language to the one choosen in the test.
      */
      translations_object.set_current_language(
        language_value_enum as language_values_global_enum,
      );
      const t = translations_object.get_messages().signup_validation;
      /*
        A request with no body should return a 500 status and a JSON body containing a property named error, with the value being the error message from the signup_validation namespace in the i18n messages JSON file choosen.
        The try catch block is returning this error.
      */
      let response = await post_signup_handler(create_mock_request(undefined));
      let { error } = await response.json();

      expect(response.status).toBe(500);
      expect(error).toBe(t.error);
      /*
        A request with an empty body should return a 400 status and erros for each attribute.
        An extra attribute should trigger also an error message in the global "_errors" parameter.
      */
      response = await post_signup_handler(
        create_mock_request({ invalid_attribute: "any" }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error._errors).toContain(t.valid_attributes);
      expect(error.username._errors).toContain(t.username_string);
      expect(error.password._errors).toContain(t.password_string);
      expect(error.confirm_password._errors).toContain(
        t.confirm_password_string,
      );
      /*
        Attributes with 0 length should trigger all zod constraints except the max constraint error message.
      */
      response = await post_signup_handler(
        create_mock_request({
          username: "",
          password: "",
          confirm_password: "",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.username._errors).toEqual([
        t.username_min,
        t.username_regex,
      ]);
      expect(error.password._errors).toEqual([
        t.password_min,
        t.password_regex_lowercase,
        t.password_regex_uppercase,
        t.password_regex_number,
        t.password_special_character,
      ]);
      /*
        Valid attributes with length > 30 should trigger the max length error.
      */
      response = await post_signup_handler(
        create_mock_request({
          username: "abcdefghijklmnopqrstuvwxyz0123456789",
          password: "abcdefghijklmnopqrstuvwxyz0123456789",
          confirm_password: "any",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.username._errors).toContain(t.username_max);
      expect(error.password._errors).toContain(t.password_max);
      /*
        Should check password matching and return an error message that the passwords does not match with 400 status.
      */
      response = await post_signup_handler(
        create_mock_request({
          username: "valid",
          password: "Password@123",
          confirm_password: "not_matching",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(400);
      expect(error.confirm_password._errors).toContain(t.passwords_dont_match);
      /*
        We have mock the finUnique to return an existing user, the API should retrun 409 status and an error message that the username exists.
      */
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        username: "username_exists",
      });

      response = await post_signup_handler(
        create_mock_request({
          username: "username_exists",
          password: "Password@123",
          confirm_password: "Password@123",
        }),
      );
      ({ error } = await response.json());

      expect(response.status).toBe(409);
      expect(error).toBe(t.username_exists);
      /*
        Should return a 500 status and an error message when the username is valid and available to use but the creation failed.
      */
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      (prisma.user.create as jest.Mock).mockResolvedValue(undefined);
      response = await post_signup_handler(
        create_mock_request({
          username: "username_does_not_exist",
          password: "Password@123",
          confirm_password: "Password@123",
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
      response = await post_signup_handler(
        create_mock_request({
          username: "username",
          password: "Password@123",
          confirm_password: "Password@123",
        }),
      );
      let { message } = await response.json();
      expect(response.status).toBe(201);
      expect(message).toBe(t.success);
    },
  );
});
