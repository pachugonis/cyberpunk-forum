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
    const { token } = body;

    // Get user's 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    // Verify the token before disabling
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { error: "Failed to disable two-factor authentication" },
      { status: 500 }
    );
  }
}
