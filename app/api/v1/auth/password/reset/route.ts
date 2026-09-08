import crypto from "crypto";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma/prisma-client";
import { getResetPasswordSchema } from "@/utils/functions";
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
        { status: 400 }
      );
    }
    /*
      Hash the provided token to match the stored hash
    */
    const hashedToken = crypto
      .createHash("sha256")
      .update(body.token)
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
        { status: 400 }
      );
    }
    /*
      Update the user's password with bcrypt hash
    */
    await prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: { password: await bcrypt.hash(body.password, Number(process.env.BCRYPT_HASH_ROUNDS)) },
    });
    /*
      Delete the token after successful reset
    */
    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenRecord.identifier },
    });
    /*
      Return success message
    */
    return NextResponse.json({ message: t("success") });
  } catch {
    /*
      Return generic 500 error message
    */
    return NextResponse.json(
      { error: t("error") },
      { status: 500 }
    );
  }
}
