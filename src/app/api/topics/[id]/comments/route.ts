import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
  parentId: z.string().optional(),
  attachmentIds: z.array(z.string()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: topicId } = await params;
    
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    if (topic.isLocked) {
      return NextResponse.json(
        { error: "This topic is locked" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, parentId, attachmentIds } = commentSchema.parse(body);

    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          author: { select: { id: true } },
        },
      });

      if (!parentComment || parentComment.topicId !== topicId) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        topicId,
        authorId: session.user.id,
        parentId,
        attachments: attachmentIds && attachmentIds.length > 0 ? {
          connect: attachmentIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
          },
        },
      },
    });

    // Create notifications
    if (parentComment) {
      // Notify the parent comment author about the reply
      await createNotification({
        userId: parentComment.author.id,
        type: "REPLY_TO_COMMENT",
        content: `${session.user.name || "Someone"} replied to your comment`,
        actorId: session.user.id,
        actorName: session.user.name || "Anonymous",
        topicId,
        commentId: comment.id,
      });
    } else {
      // Notify the topic author about the new comment
      await createNotification({
        userId: topic.authorId,
        type: "COMMENT_ON_TOPIC",
        content: `${session.user.name || "Someone"} commented on your topic "${topic.title}"`,
        actorId: session.user.id,
        actorName: session.user.name || "Anonymous",
        topicId,
        commentId: comment.id,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
