import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import bcrypt from "bcryptjs";
import { allowAuthAttempt, TOO_MANY_ATTEMPTS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, token } = body;

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: "Email, password, and token are required" },
        { status: 400 }
      );
    }

    if (!allowAuthAttempt(request, "2fa", String(email))) {
      return NextResponse.json({ error: TOO_MANY_ATTEMPTS }, { status: 429 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      // Same response as a wrong password, so this can't be used to probe accounts
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify 2FA token
    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    return NextResponse.json(
      { error: "Failed to verify two-factor authentication" },
      { status: 500 }
    );
  }
}
