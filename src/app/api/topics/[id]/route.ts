import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deductTopicDeletionReputation } from "@/lib/reputation";
import { z } from "zod";

const updateTopicSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200).optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  categoryId: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const topic = await prisma.topic.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true, bio: true },
        },
        category: true,
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
        comments: {
          where: { parentId: null },
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
            replies: {
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
                replies: {
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
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

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
    
    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Cannot edit deleted topics
    if (topic.deletedAt) {
      return NextResponse.json(
        { error: "Cannot edit deleted topic" },
        { status: 403 }
      );
    }

    const isAuthor = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isModerator = session.user.role === "MODERATOR";

    if (!isAuthor && !isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Not authorized to edit this topic" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateTopicSchema.parse(body);

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      editedAt: new Date(),
    };

    // Validate category if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        category: true,
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

    return NextResponse.json(updatedTopic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
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
    
    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const isAuthor = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isModerator = session.user.role === "MODERATOR";

    if (!isAuthor && !isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Not authorized to delete this topic" },
        { status: 403 }
      );
    }

    // Soft delete - set deletedAt timestamp
    await prisma.topic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Deduct reputation for deleting a topic
    await deductTopicDeletionReputation(topic.authorId);

    return NextResponse.json({ message: "Topic deleted" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
