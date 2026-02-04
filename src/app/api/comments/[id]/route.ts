import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export async function PUT(
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

    const { id } = await params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        topic: {
          select: { isLocked: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.topic.isLocked) {
      return NextResponse.json(
        { error: "Cannot edit comment in locked topic" },
        { status: 403 }
      );
    }

    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isModerator = session.user.role === "MODERATOR";

    if (!isAuthor && !isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Not authorized to edit this comment" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = updateCommentSchema.parse(body);

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
        editedAt: new Date(),
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
        reactions: {
          select: { type: true, userId: true },
        },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = await params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        topic: {
          select: { isLocked: true },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.topic.isLocked) {
      return NextResponse.json(
        { error: "Cannot delete comment in locked topic" },
        { status: 403 }
      );
    }

    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isModerator = session.user.role === "MODERATOR";

    if (!isAuthor && !isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete attachments from disk if any
    if (comment.attachments && comment.attachments.length > 0) {
      const { unlink } = await import("fs/promises");
      const { join } = await import("path");
      const { existsSync } = await import("fs");

      for (const attachment of comment.attachments) {
        const filepath = join(process.cwd(), "public", "uploads", attachment.filename);
        if (existsSync(filepath)) {
          try {
            await unlink(filepath);
          } catch (error) {
            console.error(`Failed to delete file ${attachment.filename}:`, error);
          }
        }
      }

      // Delete attachment records from database
      await prisma.attachment.deleteMany({
        where: { commentId: id },
      });
    }

    // Soft delete: just mark as deleted
    const deletedComment = await prisma.comment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        content: "[deleted]",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
