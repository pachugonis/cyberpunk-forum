import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
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

    // Get the target (topic or comment) to find the author
    let targetAuthorId: string | null = null;
    let targetTitle = "";
    
    if (targetType === "topic") {
      const topic = await prisma.topic.findUnique({
        where: { id: targetId },
        select: { authorId: true, title: true },
      });
      if (topic) {
        targetAuthorId = topic.authorId;
        targetTitle = topic.title;
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { authorId: true, topicId: true },
      });
      if (comment) {
        targetAuthorId = comment.authorId;
      }
    }

    await prisma.reaction.create({
      data: {
        type,
        userId: session.user.id,
        ...(targetType === "topic" ? { topicId: targetId } : { commentId: targetId }),
      },
    });

    // Create notification for the author
    if (targetAuthorId) {
      const notificationType = targetType === "topic" ? "REACTION_ON_TOPIC" : "REACTION_ON_COMMENT";
      const content = targetType === "topic"
        ? `${session.user.name || "Someone"} reacted ${type} to your topic "${targetTitle}"`
        : `${session.user.name || "Someone"} reacted ${type} to your comment`;

      await createNotification({
        userId: targetAuthorId,
        type: notificationType,
        content,
        actorId: session.user.id,
        actorName: session.user.name || "Anonymous",
        topicId: targetType === "topic" ? targetId : undefined,
        commentId: targetType === "comment" ? targetId : undefined,
      });
    }

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
