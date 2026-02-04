import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");
    const authorId = searchParams.get("author");
    const sortBy = searchParams.get("sort") || "recent";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const isPinned = searchParams.get("isPinned");
    const isLocked = searchParams.get("isLocked");
    const hasAttachments = searchParams.get("hasAttachments");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Build dynamic where clause
    const whereClause: any = {
      deletedAt: null, // Exclude deleted topics
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    };

    // Add category filter
    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }

    // Add author filter
    if (authorId && authorId !== "all") {
      whereClause.authorId = authorId;
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    // Add pinned filter
    if (isPinned === "true") {
      whereClause.isPinned = true;
    } else if (isPinned === "false") {
      whereClause.isPinned = false;
    }

    // Add locked filter
    if (isLocked === "true") {
      whereClause.isLocked = true;
    } else if (isLocked === "false") {
      whereClause.isLocked = false;
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "popular":
        orderBy = { viewCount: "desc" };
        break;
      case "comments":
        orderBy = { comments: { _count: "desc" } };
        break;
      case "reactions":
        orderBy = { reactions: { _count: "desc" } };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Base query
    let results = await prisma.topic.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: {
          select: { comments: true, reactions: true, attachments: true },
        },
      },
      orderBy,
      take: 100,
    });

    // Filter by attachments if needed (post-query filter)
    if (hasAttachments === "true") {
      results = results.filter((topic: { _count: { attachments: number } }) => topic._count.attachments > 0);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
