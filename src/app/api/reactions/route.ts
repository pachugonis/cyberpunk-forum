import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import {
  awardTopicReactionReputation,
  awardCommentReactionReputation,
  removeTopicReactionReputation,
  removeCommentReactionReputation,
} from "@/lib/reputation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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

    const userId = session.user.id;
    const targetWhere = targetType === "topic" ? { topicId: targetId } : { commentId: targetId };

    // Resolve the target first: reacting to missing or deleted content is not allowed
    let targetAuthorId: string;
    let targetTitle = "";

    if (targetType === "topic") {
      const topic = await prisma.topic.findUnique({
        where: { id: targetId },
        select: { authorId: true, title: true, deletedAt: true },
      });
      if (!topic || topic.deletedAt) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }
      targetAuthorId = topic.authorId;
      targetTitle = topic.title;
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { authorId: true, deletedAt: true },
      });
      if (!comment || comment.deletedAt) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      targetAuthorId = comment.authorId;
    }

    // Reacting to your own content earns no reputation and sends no notification
    const isOwnContent = targetAuthorId === userId;

    // Toggle off: deleteMany is atomic, so concurrent requests can't both remove it
    const removed = await prisma.reaction.deleteMany({
      where: { userId, type, ...targetWhere },
    });

    if (removed.count > 0) {
      if (!isOwnContent) {
        if (targetType === "topic") {
          await removeTopicReactionReputation(targetAuthorId);
        } else {
          await removeCommentReactionReputation(targetAuthorId);
        }
      }
      return NextResponse.json({ action: "removed" });
    }

    try {
      await prisma.reaction.create({
        data: { type, userId, ...targetWhere },
      });
    } catch (error) {
      // A concurrent request already added the same reaction
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json({ action: "added" }, { status: 201 });
      }
      throw error;
    }

    if (!isOwnContent) {
      const notificationType = targetType === "topic" ? "REACTION_ON_TOPIC" : "REACTION_ON_COMMENT";
      const content = targetType === "topic"
        ? `${session.user.name || "Someone"} reacted ${type} to your topic "${targetTitle}"`
        : `${session.user.name || "Someone"} reacted ${type} to your comment`;

      await createNotification({
        userId: targetAuthorId,
        type: notificationType,
        content,
        actorId: userId,
        actorName: session.user.name || "Anonymous",
        topicId: targetType === "topic" ? targetId : undefined,
        commentId: targetType === "comment" ? targetId : undefined,
      });

      // Award reputation for receiving a reaction
      if (targetType === "topic") {
        await awardTopicReactionReputation(targetAuthorId);
      } else {
        await awardCommentReactionReputation(targetAuthorId);
      }
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
