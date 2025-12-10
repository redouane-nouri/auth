import bcrypt from "bcrypt";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma/prisma-client";
import { getUserSignupSchema } from "../../../../../utils/functions";
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Creates a new user account with input validation and checks for existing emails.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 minLength: 8
 *                 maxLength: 30
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!-\\/:-@[-`{-~]).+$"
 *                 example: Password@123
 *               confirmPassword:
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
 *                     email:
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
 *                     confirmPassword:
 *                       type: object
 *                       properties:
 *                         _errors:
 *                           type: array
 *                           items:
 *                             type: string
 *                   example:
 *                     _errors: ["i18n global error 1", "i18n global error 2", "etc."]
 *                     email: {_errors: ["i18n email is required", "Email must be valid", "etc."]}
 *                     password: {_errors: ["Password must be a String", "etc."]}
 *                     confirmPassword: {_errors: ["Passwords don't match", "etc."]}
 *       409:
 *         description: Email already exists.
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
export async function POST(request: NextRequest) {
  /*
    It has to be here inside a request scope, if not, it will throw error because we are using `await cookies()` inside the `getTranslations()`, and the `cookies()` function is only callable from inside a request scope.
  */
  const t = await getTranslations("signupValidation");
  /*
    The schema to be used for signup input validation with i18n messages
  */
  const userSignupSchema = getUserSignupSchema(t);

  try {
    /*
      Extract the request body
    */
    const body = await request.json();
    /*
      Invoke the zod parsing process
    */
    const result = userSignupSchema.safeParse(body);
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
      If the email already exist then send a 409 status for conflict and an error message.
    */
    if (await prisma.user.findUnique({ where: { email: body.email } })) {
      return NextResponse.json({ error: t("emailExists") }, { status: 409 });
    }
    /*
      Create the user and check the return value. If not created, then return an error with 500 status for internal server error.
    */
    if (
      !(await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
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
