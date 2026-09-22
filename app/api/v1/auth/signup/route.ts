import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma/prisma-client";
import {
  getBcryptHashRounds,
  getClientIp,
  getSignupSchema,
} from "../../../../../utils/functions";
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
      Limit signup requests per IP address, checked first since it's a cheap Redis lookup, before we pay for the auth() session lookup below
    */
    if (await isRateLimited(signupIpRateLimiter, getClientIp(request))) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: StatusCodes.TOO_MANY_REQUESTS },
      );
    }
    /*
      If user already signed in and tries to singup send a 409 status for conflict and an already signed in error message.
    */
    if (await auth())
      return NextResponse.json(
        { error: t("alreadySignedIn") },
        { status: StatusCodes.CONFLICT },
      );
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
        { status: StatusCodes.BAD_REQUEST },
      );
    }
    /*
      Also limit per email address, on top of the IP limit
    */
    if (await isRateLimited(signupEmailRateLimiter, result.data.email)) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: StatusCodes.TOO_MANY_REQUESTS },
      );
    }
    /*
      If the email already exist then send a 409 status for conflict and an error message.
    */
    if (await prisma.user.findUnique({ where: { email: result.data.email } })) {
      return NextResponse.json(
        { error: t("emailExists") },
        { status: StatusCodes.CONFLICT },
      );
    }
    /*
      Create the user. Prisma either returns the created row or throws, so a failure here is caught
      by the outer catch block below.
    */
    await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: await bcrypt.hash(
          result.data.password,
          getBcryptHashRounds(),
        ),
      },
    });
    /*
      If the user created successfully. The retun a success message with 201 status for successful creation.
    */
    return NextResponse.json(
      { message: t("success") },
      { status: StatusCodes.CREATED },
    );
  } catch (error) {
    console.error("POST /api/v1/auth/signup failed", error);
    return NextResponse.json(
      { error: t("error") },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
