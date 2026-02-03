import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateRecoveryCode } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const recoveryCode = generateRecoveryCode();
    // Hash the code without dashes for comparison during recovery
    const cleanCode = recoveryCode.replace(/-/g, '');
    const hashedRecoveryCode = await bcrypt.hash(cleanCode, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        recoveryCode: hashedRecoveryCode,
      },
    });

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: user.id,
        recoveryCode: recoveryCode // Return plain code only once
      },
      { status: 201 }
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
