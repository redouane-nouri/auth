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
  const t = await getTranslations("forgotPasswordValidation");

  try {
    const forgotPasswordSchema = getForgotPasswordSchema(t);
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user)
      return NextResponse.json({ message: t("success") });

    await prisma.verificationToken.deleteMany({
      where: { identifier: body.email },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.verificationToken.create({
      data: {
        identifier: body.email,
        token: hashedToken,
        expires: new Date(Date.now() + 1000 * 60 * 10),
      },
    });

    const transporter = getMailerTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: body.email,
      subject: "Reset your password",
      html: await render(
        React.createElement(ResetPasswordEmail, { token: rawToken })
      ),
      text: `${process.env.NEXT_PUBLIC_URL}/reset?token=${rawToken}`,
    });

    return NextResponse.json({ message: t("success") });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: t("error") },
      { status: 500 }
    );
  }
}
