import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const reactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "FIRE", "CYBER", "HACK"]),
  targetId: z.string(),
  targetType: z.enum(["topic", "comment"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, targetId, targetType } = reactionSchema.parse(body);

    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId: session.user.id,
        type,
        ...(targetType === "topic" ? { topicId: targetId } : { commentId: targetId }),
      },
    });

    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return NextResponse.json({ action: "removed" });
    }

    await prisma.reaction.create({
      data: {
        type,
        userId: session.user.id,
        ...(targetType === "topic" ? { topicId: targetId } : { commentId: targetId }),
      },
    });

    return NextResponse.json({ action: "added" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
