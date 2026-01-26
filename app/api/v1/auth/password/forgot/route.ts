import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma/prisma-client";
import { getForgotPasswordSchema } from "@/utils/functions";
import { render } from "@react-email/render";
import React from "react";
import ResetPasswordEmail from "@/components/auth/ResetPasswordEmailHtml";
import { getMailerTransporter } from "@/lib/mailer/mailer";

export async function POST(request: NextRequest) {
  /* 
    Load i18n translations for forgot password validation messages
  */
  const t = await getTranslations("forgotPasswordValidation");
  try {
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
        { status: 400 }
      );
    }
    /*
      Check if the user exists in the database
    */
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });
    /*
      If user does not exist, return success anyway to avoid leaking info
    */
    if (!user)
      return NextResponse.json({ message: t("success") });
    /*
      Delete any existing verification tokens for this email
    */
    await prisma.verificationToken.deleteMany({
      where: { identifier: body.email },
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
        identifier: body.email,
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
    const resetUrl = `${baseUrl}${process.env.NEXT_PUBLIC_AXIOS_BASEPATH}/password/reset?token=${rawToken}`;
    /*
      Send the password reset email, use React email component rendered to HTML, also include plain text fallback
    */
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: body.email,
      subject: "Reset your password",
      html: await render(
        React.createElement(ResetPasswordEmail, { token: rawToken })
      ),
      text: `Reset your password: ${resetUrl}`,
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
