import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
        reactions: {
          select: { type: true, userId: true },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: { id: true, name: true, image: true, role: true },
            },
            reactions: {
              select: { type: true, userId: true },
            },
            replies: {
              include: {
                author: {
                  select: { id: true, name: true, image: true, role: true },
                },
                reactions: {
                  select: { type: true, userId: true },
                },
                replies: {
                  include: {
                    author: {
                      select: { id: true, name: true, image: true, role: true },
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

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Topic deleted" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
