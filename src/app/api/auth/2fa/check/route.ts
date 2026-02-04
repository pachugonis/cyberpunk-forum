import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
