import bcrypt from "bcrypt";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma/prisma-client";
import { getClientIp, getSignupSchema } from "../../../../../utils/functions";
import { auth } from "@/lib/auth/auth";
import {
  isRateLimited,
  signupEmailRateLimiter,
  signupIpRateLimiter,
} from "@/lib/rateLimiter/rateLimiter";

export async function POST(request: NextRequest) {
  /*
    It has to be here inside a request scope, if not, it will throw error because we are using `await cookies()` inside the `getTranslations()`, and the `cookies()` function is only callable from inside a request scope.
  */
  const t = await getTranslations("signupValidation");

  try {
    /*
      If user already signed in and tries to authenticate send a 409 status for conflict and an already signed in error message.
    */
    if (await auth())
      return NextResponse.json(
        { error: t("alreadySignedIn") },
        { status: 409 },
      );
    /*
      Limit signup requests per IP address
    */
    if (await isRateLimited(signupIpRateLimiter, getClientIp(request))) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: 429 },
      );
    }
    /*
      The schema to be used for signup input validation with i18n messages
    */
    const userSignupSchema = getSignupSchema(t);
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
        { status: 400 },
      );
    }
    /*
      Also limit per email address, on top of the IP limit
    */
    if (await isRateLimited(signupEmailRateLimiter, result.data.email)) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: 429 },
      );
    }
    /*
      If the email already exist then send a 409 status for conflict and an error message.
    */
    if (await prisma.user.findUnique({ where: { email: result.data.email } })) {
      return NextResponse.json({ error: t("emailExists") }, { status: 409 });
    }
    /*
      Create the user and check the return value. If not created, then return an error with 500 status for internal server error.
    */
    if (
      !(await prisma.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          password: await bcrypt.hash(
            result.data.password,
            Number(process.env.BCRYPT_HASH_ROUNDS),
          ),
        },
      }))
    ) {
      return NextResponse.json({ error: t("error") }, { status: 500 });
    }
    /*
      If the user created successfully. The retun a success message with 201 status for successful creation.
    */
    return NextResponse.json({ message: t("success") }, { status: 201 });
  } catch {
    /*
      Catch any other erros and return an error message with 500 status for internal server error.
    */
    return NextResponse.json({ error: t("error") }, { status: 500 });
  }
}
