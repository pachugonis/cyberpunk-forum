import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: "Token and secret are required" },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Save the secret and enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Failed to verify two-factor authentication" },
      { status: 500 }
    );
  }
}
