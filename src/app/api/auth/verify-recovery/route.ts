import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  recoveryCode: z.string().min(16, "Invalid recovery code"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, recoveryCode } = verifySchema.parse(body);

    // Remove dashes from recovery code for comparison
    const cleanCode = recoveryCode.replace(/-/g, '');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or recovery code" },
        { status: 400 }
      );
    }

    if (!user.recoveryCode) {
      return NextResponse.json(
        { error: "No recovery code found for this account" },
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

    return NextResponse.json(
      { message: "Recovery code verified successfully" },
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
