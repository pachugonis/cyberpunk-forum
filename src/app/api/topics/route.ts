import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardTopicCreationReputation } from "@/lib/reputation";
import { z } from "zod";

const topicSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string(),
  attachmentIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = categoryId ? { categoryId } : {};

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
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
          _count: {
            select: { comments: true, reactions: true },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.topic.count({ where }),
    ]);

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

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
    const { title, content, categoryId, attachmentIds } = topicSchema.parse(body);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        content,
        categoryId,
        authorId: session.user.id,
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

    // Award reputation for creating a topic
    await awardTopicCreationReputation(session.user.id);

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
