import crypto from "crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma/prisma-client";
import { getClientIp, getForgotPasswordSchema } from "@/utils/functions";
import { render } from "@react-email/render";
import React from "react";
import ResetPasswordEmail from "@/components/auth/ResetPasswordEmailHtml";
import { getMailerTransporter } from "@/lib/mailer/mailer";
import {
  forgotPasswordEmailRateLimiter,
  forgotPasswordIpRateLimiter,
  isRateLimited,
} from "@/lib/rateLimiter/rateLimiter";

export async function POST(request: NextRequest) {
  /*
    Load i18n translations for forgot password validation messages
  */
  const t = await getTranslations("forgotPasswordValidation");
  try {
    /*
      Limit how many times this endpoint can be hit per IP.
    */
    if (
      await isRateLimited(forgotPasswordIpRateLimiter, getClientIp(request))
    ) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: 429 },
      );
    }
    /*
      Get the Zod validation schema for the forgot password request
    */
    const forgotPasswordSchema = getForgotPasswordSchema(t);
    /*
      Parse the request body
    */
    const body = await request.json();
    /*
      Validate the body against the schema
    */
    const result = forgotPasswordSchema.safeParse(body);
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
      Also limit per email address, on top of the IP limit.
    */
    if (
      await isRateLimited(forgotPasswordEmailRateLimiter, result.data.email)
    ) {
      return NextResponse.json(
        { error: t("tooManyRequests") },
        { status: 429 },
      );
    }
    /*
      We run this in using 'after' to prevent timing side-channel.
    */
    after(() => issueResetTokenAndSendEmail(result.data.email));
    /*
      Return success message anyway to avoid leaking info
    */
    return NextResponse.json({ message: t("success") });
  } catch {
    /*
      Return generic 500 error message
    */
    return NextResponse.json({ error: t("error") }, { status: 500 });
  }
}

/*
  Looks up the user and, if he exists, issues him a reset token and emails it to him.
*/
async function issueResetTokenAndSendEmail(email: string) {
  try {
    /*
      Check if the user exists in the database
    */
    const user = await prisma.user.findUnique({ where: { email } });
    /*
      If user does not exist, there is nothing to do
    */
    if (!user) return;
    /*
      Delete any existing verification tokens for this email
    */
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    /*
      Generate a secure random token
    */
    const rawToken = crypto.randomBytes(32).toString("hex");
    /*
      Hash the token before storing in the database
    */
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    /*
      Create a new verification token record in the database (Expires in 10 minutes)
    */
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 1000 * 60 * 10),
      },
    });
    /*
      Get the nodemailer transporter
    */
    const transporter = getMailerTransporter();
    /*
      prepare the reset url
    */
    const baseUrl = process.env.NEXT_PUBLIC_URL!;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    /*
      Send the password reset email, use React email component rendered to HTML, also include plain text fallback
    */
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: await render(
        React.createElement(ResetPasswordEmail, { token: rawToken }),
      ),
      text: `Reset your password: ${resetUrl}`,
    });
  } catch {
    /*
      The response was already sent by the time this runs, there is no one left to report the error to
    */
  }
}
