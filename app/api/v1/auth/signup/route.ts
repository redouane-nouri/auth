import bcrypt from "bcrypt";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../../lib/prisma/prisma_client";
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Creates a new user account with input validation and checks for existing usernames.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - confirm_password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 minLength: 1
 *                 maxLength: 30
 *                 pattern: "^[a-zA-Z0-9_-]+$"
 *                 example: redouane_nouri
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 minLength: 8
 *                 maxLength: 30
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!-\\/:-@[-`{-~]).+$"
 *                 example: Password@123
 *               confirm_password:
 *                 type: string
 *                 description: Must match the `password` field.
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: i18n success message.
 *       400:
 *         description: Validation errors in the request input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   description: Detailed validation errors.
 *                   properties:
 *                     _errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     username:
 *                       type: object
 *                       properties:
 *                         _errors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     password:
 *                       type: object
 *                       properties:
 *                         _errors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     confirm_password:
 *                       type: object
 *                       properties:
 *                         _errors:
 *                           type: array
 *                           items:
 *                             type: string
 *                   example:
 *                     _errors: ["i18n global error 1", "i18n global error 2", "etc."]
 *                     username: {_errors: ["i18n username is required", "Username must be less than or equal to 30 characters", "etc."]}
 *                     password: {_errors: ["Password must be a String", "etc."]}
 *                     confirm_password: {_errors: ["Passwords don't match", "etc."]}
 *                     
 *       409:
 *         description: Username already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: i18n user exist message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: i18n something went wrong message.
 */
export async function POST(request: Request) {
  /*
    It has to be here inside a request scope, if not, it will throw error because we are using `await cookies()` inside the `getTranslations()`, and the `cookies()` function is only callable from inside a request scope.
  */
  const t = await getTranslations("signup_validation");
  /*
    The schema to be used for input validation with i18n messages
  */
  const user_signup_schema = z
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
      confirm_password: z.string({ message: t("username_string") }),
    })
    .strict(t("valid_attributes"))
    .refine((data) => data.password === data.confirm_password, {
      message: t("passwords_dont_match"),
      path: ["confirm_password"],
    });

  try {
    /*
      Extract the request body
    */
    const body = await request.json();
    /*
      Invoke the zod parsing process
    */
    const result = user_signup_schema.safeParse(body);
    /*
      If the parsing failed, then send back the erros with 400 status for bad request.
    */
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.format(),
        },
        { status: 400 }
      );
    }
    /*
      If the username already exist then send a 409 status for conflict and an error message.
    */
    if (await prisma.user.findUnique({ where: { username: body.username } })) {
      return NextResponse.json(
        { error: t("username_exists") },
        { status: 409 }
      );
    }
    /*
      Create the user and check the return value. If not created, then return an error with 500 status for internal server error.
    */
    if (
      !(await prisma.user.create({
        data: {
          username: body.username,
          password: await bcrypt.hash(body.password, 10),
        },
      }))
    ) {
      return NextResponse.json({ error: t("error") }, { status: 500 });
    }
    /*
      If the user created successfully. The retun a success message with 201 status for successful creation.
    */
    return NextResponse.json({ message: t("success") }, { status: 201 });
  } catch (error) {
    /*
      Catch any other erros and return an error message with 500 status for internal server error.
    */
    return NextResponse.json({ error: t("error") }, { status: 500 });
  }
}
