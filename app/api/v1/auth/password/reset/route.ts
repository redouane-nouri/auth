import crypto from "crypto";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma/prisma-client";
import { getClientIp, getResetPasswordSchema } from "@/utils/functions";
import {
  isRateLimited,
  resetPasswordIpRateLimiter,
} from "@/lib/rateLimiter/rateLimiter";
/**
 * POST /api/v1/auth/password/reset
 * Handles resetting user password given a valid token
 */
export async function POST(request: NextRequest) {
  /*
    Load i18n translations for reset password validation messages
  */
  const t = await getTranslations("resetPasswordValidation");

  try {
    /*
      Limit reset password requests per IP address
    */
    if (await isRateLimited(resetPasswordIpRateLimiter, getClientIp(request))) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: 429 },
      );
    }
    /*
      Get the Zod validation schema for the reset password request
    */
    const resetPasswordSchema = getResetPasswordSchema(t);
    /*
      Parse the request body
    */
    const body = await request.json();
    /*
      Validate the body against the schema
    */
    const result = resetPasswordSchema.safeParse(body);
    /*
      If validation fails, return 400 with detailed errors
    */
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 },
      );
    }
    /*
      Hash the provided token to match the stored hash
    */
    const hashedToken = crypto
      .createHash("sha256")
      .update(result.data.token)
      .digest("hex");
    /*
      Find the verification token in the database and check expiry
    */
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        expires: { gte: new Date() },
      },
    });
    /*
      If token not found or expired, return generic error
    */
    if (!tokenRecord) {
      return NextResponse.json({ error: t("tokenInvalid") }, { status: 400 });
    }
    /*
      Update the user's password with bcrypt hash
    */
    const updatedUser = await prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: {
        password: await bcrypt.hash(
          result.data.password,
          Number(process.env.BCRYPT_HASH_ROUNDS),
        ),
      },
    });
    /*
      Delete the token after successful reset
    */
    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenRecord.identifier },
    });
    /*
      Revoke all existing sessions so a stolen/active session can't survive a password reset
    */
    await prisma.session.deleteMany({
      where: { userId: updatedUser.id },
    });
    /*
      Return success message
    */
    return NextResponse.json({ message: t("success") });
  } catch {
    /*
      Return generic 500 error message
    */
    return NextResponse.json({ error: t("error") }, { status: 500 });
  }
}
