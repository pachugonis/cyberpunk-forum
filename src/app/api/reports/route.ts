import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createReportSchema = z.object({
  reason: z.string().min(3, "Reason must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  topicId: z.string().optional(),
  commentId: z.string().optional(),
}).refine(data => data.topicId || data.commentId, {
  message: "Either topicId or commentId must be provided",
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
    const { reason, description, topicId, commentId } = createReportSchema.parse(body);

    // Check if the content exists
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) {
        return NextResponse.json(
          { error: "Topic not found" },
          { status: 404 }
        );
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }
    }

    // Check if user already reported this content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        ...(topicId && { topicId }),
        ...(commentId && { commentId }),
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reason,
        description,
        reporterId: session.user.id,
        ...(topicId && { topicId }),
        ...(commentId && { commentId }),
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        topic: {
          select: { id: true, title: true },
        },
        comment: {
          select: { id: true, content: true },
        },
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins and moderators can view all reports
    if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, image: true },
          },
          topic: {
            select: { 
              id: true, 
              title: true,
              author: {
                select: { id: true, name: true },
              },
            },
          },
          comment: {
            select: { 
              id: true, 
              content: true,
              author: {
                select: { id: true, name: true },
              },
              topic: {
                select: { id: true, title: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
