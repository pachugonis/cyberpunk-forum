import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAndAwardBadges, getUserBadges, getUserBadgeStats } from "@/lib/badges";

/**
 * GET /api/badges?userId=xxx
 * Get all badges for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (action === "stats") {
      const stats = await getUserBadgeStats(userId);
      return NextResponse.json({ stats });
    }

    const badges = await getUserBadges(userId);
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges/check
 * Check and award badges for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = body.userId || session.user.id;

    // Only allow checking badges for self unless admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const newBadges = await checkAndAwardBadges(userId);
    
    return NextResponse.json({ 
      success: true, 
      newBadges,
      count: newBadges.length 
    });
  } catch (error) {
    console.error("Error checking badges:", error);
    return NextResponse.json(
      { error: "Failed to check badges" },
      { status: 500 }
    );
  }
}
