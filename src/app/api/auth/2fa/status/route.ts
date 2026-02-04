import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to check two-factor authentication status" },
      { status: 500 }
    );
  }
}
