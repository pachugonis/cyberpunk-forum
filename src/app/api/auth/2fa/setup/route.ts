import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTwoFactorSecret, generateQRCode } from "@/lib/two-factor";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    // Generate new secret
    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Store secret temporarily in session or return it
    // Note: The secret is not saved to database yet, only after verification
    return NextResponse.json({
      secret,
      qrCode,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Failed to setup two-factor authentication" },
      { status: 500 }
    );
  }
}
