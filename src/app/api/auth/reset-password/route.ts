import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateRecoveryCode } from "@/lib/utils";
import { allowAuthAttempt, TOO_MANY_ATTEMPTS } from "@/lib/rate-limit";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
  recoveryCode: z.string().min(16, "Invalid recovery code"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, recoveryCode, newPassword } = resetSchema.parse(body);

    if (!allowAuthAttempt(request, "recovery", email)) {
      return NextResponse.json({ error: TOO_MANY_ATTEMPTS }, { status: 429 });
    }

    // Remove dashes from recovery code for comparison
    const cleanCode = recoveryCode.replace(/-/g, '');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Same response for every failure so accounts can't be probed
    if (!user || !user.recoveryCode) {
      return NextResponse.json(
        { error: "Invalid email or recovery code" },
        { status: 400 }
      );
    }

    const isValidCode = await bcrypt.compare(cleanCode, user.recoveryCode);

    if (!isValidCode) {
      return NextResponse.json(
        { error: "Invalid email or recovery code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // A recovery code is single-use: issue a new one along with the new password
    const newRecoveryCode = generateRecoveryCode();
    const hashedRecoveryCode = await bcrypt.hash(newRecoveryCode.replace(/-/g, ''), 12);

    // passwordChangedAt ends all sessions issued before the reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        recoveryCode: hashedRecoveryCode,
        passwordChangedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully", recoveryCode: newRecoveryCode },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
