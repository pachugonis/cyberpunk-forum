import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, TOO_MANY_ATTEMPTS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`2fa-check:ip:${getClientIp(request)}`, 30, 15 * 60 * 1000)) {
      return NextResponse.json({ error: TOO_MANY_ATTEMPTS }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        requiresTwoFactor: false,
      });
    }

    return NextResponse.json({
      requiresTwoFactor: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Error checking 2FA requirement:", error);
    return NextResponse.json(
      { error: "Failed to check two-factor authentication requirement" },
      { status: 500 }
    );
  }
}
