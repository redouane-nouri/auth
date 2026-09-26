import crypto from "crypto";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma/prisma-client";
import {
  getBcryptHashRoundsFromEnv,
  getClientIp,
  getResetPasswordSchema,
} from "@/utils/functions";
import {
  isRateLimited,
  resetPasswordIpRateLimiter,
} from "@/lib/rateLimiter/rateLimiter";
import { invalidateCachedSession } from "@/lib/redis/sessionCache";
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
        { status: StatusCodes.TOO_MANY_REQUESTS },
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
        { status: StatusCodes.BAD_REQUEST },
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
      return NextResponse.json(
        { error: t("tokenInvalid") },
        { status: StatusCodes.BAD_REQUEST },
      );
    }
    /*
      Hash the new password before starting the transaction below, since it doesn't need DB
      isolation and hashing is comparatively slow - no reason to hold the transaction open for it.
    */
    const hashedPassword = await bcrypt.hash(
      result.data.password,
      getBcryptHashRoundsFromEnv(),
    );
    /*
      Update the password, delete the token, and revoke every existing session as one transaction.
    */
    const sessionsToInvalidateCache = await prisma.$transaction(async (tx) => {
      /*
        Update the user's password with bcrypt hash
      */
      const updatedUser = await tx.user.update({
        where: { email: tokenRecord.identifier },
        data: { password: hashedPassword },
      });
      /*
        Delete the token after successful reset
      */
      await tx.verificationToken.deleteMany({
        where: { identifier: tokenRecord.identifier },
      });
      /*
        Revoke all existing sessions.
      */
      const sessions = await tx.session.findMany({
        where: { userId: updatedUser.id },
        select: { sessionToken: true },
      });

      await tx.session.deleteMany({
        where: { userId: updatedUser.id },
      });

      return sessions;
    });
    /*
      Invalidate Cached Sessions
    */
    await Promise.all(
      sessionsToInvalidateCache.map((session) =>
        invalidateCachedSession(session.sessionToken),
      ),
    );
    /*
      Return success message
    */
    return NextResponse.json({ message: t("success") });
  } catch (error) {
    console.error("POST /api/v1/auth/password/reset failed", error);
    return NextResponse.json(
      { error: t("error") },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
