import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver is required"),
  content: z.string().trim().min(1, "Message cannot be empty").max(5000),
});

// GET all conversations for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    // If otherUserId is provided, get messages for that conversation
    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: session.user.id,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: session.user.id
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 200 // most recent history only
      });

      return NextResponse.json(messages.reverse());
    }

    // Otherwise, get all conversations: the latest message per partner plus
    // the unread count, computed in SQL instead of loading every message
    const userId = session.user.id;
    const latest = await prisma.$queryRaw<
      { id: string; otherId: string; unreadCount: number | bigint }[]
    >`
      WITH mine AS (
        SELECT id, createdAt,
          CASE WHEN senderId = ${userId} THEN receiverId ELSE senderId END AS otherId
        FROM messages
        WHERE senderId = ${userId} OR receiverId = ${userId}
      ),
      ranked AS (
        SELECT id, otherId,
          ROW_NUMBER() OVER (PARTITION BY otherId ORDER BY createdAt DESC) AS rn
        FROM mine
      )
      SELECT r.id, r.otherId,
        (SELECT COUNT(*) FROM messages u
          WHERE u.receiverId = ${userId} AND u.senderId = r.otherId AND u.isRead = 0
        ) AS unreadCount
      FROM ranked r
      WHERE r.rn = 1
    `;

    const [latestMessages, otherUsers] = await Promise.all([
      prisma.message.findMany({
        where: { id: { in: latest.map((row) => row.id) } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { id: { in: latest.map((row) => row.otherId) } },
        select: { id: true, name: true, image: true },
      }),
    ]);

    const rowsById = new Map(latest.map((row) => [row.id, row]));
    const usersById = new Map(otherUsers.map((user) => [user.id, user]));

    const conversations = latestMessages.flatMap((msg) => {
      const row = rowsById.get(msg.id)!;
      const otherUser = usersById.get(row.otherId);
      return otherUser
        ? [{ ...msg, otherUser, unreadCount: Number(row.unreadCount) }]
        : [];
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = sendMessageSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { receiverId, content } = parsed.data;

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send a message to yourself" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { id: session.user.id }
            }
          },
          {
            participants: {
              some: { id: receiverId }
            }
          }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: session.user.id },
              { id: receiverId }
            ]
          }
        }
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        conversationId: conversation.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        type: "NEW_MESSAGE",
        content: `${session.user.name || "Someone"} sent you a message`,
        userId: receiverId,
        actorId: session.user.id,
        actorName: session.user.name || "Anonymous"
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, senderId } = await request.json();

    if (!conversationId && !senderId) {
      return NextResponse.json(
        { error: "Conversation ID or Sender ID is required" },
        { status: 400 }
      );
    }

    const whereClause: Prisma.MessageWhereInput = {
      receiverId: session.user.id,
      isRead: false
    };

    if (conversationId) {
      whereClause.conversationId = conversationId;
    }
    if (senderId) {
      whereClause.senderId = senderId;
    }

    await prisma.message.updateMany({
      where: whereClause,
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
