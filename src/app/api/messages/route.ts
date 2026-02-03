import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
              email: true,
              image: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      return NextResponse.json(messages);
    }

    // Otherwise, get all conversations
    const sentMessages = await prisma.message.findMany({
      where: {
        senderId: session.user.id
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const receivedMessages = await prisma.message.findMany({
      where: {
        receiverId: session.user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Group messages by conversation and get latest message for each user
    const conversationsMap = new Map();

    sentMessages.forEach((msg) => {
      const otherUserId = msg.receiver.id;
      if (!conversationsMap.has(otherUserId) || 
          conversationsMap.get(otherUserId).createdAt < msg.createdAt) {
        conversationsMap.set(otherUserId, {
          ...msg,
          otherUser: msg.receiver,
          unreadCount: 0
        });
      }
    });

    receivedMessages.forEach((msg) => {
      const otherUserId = msg.sender.id;
      const existing = conversationsMap.get(otherUserId);
      
      if (!existing || existing.createdAt < msg.createdAt) {
        conversationsMap.set(otherUserId, {
          ...msg,
          otherUser: msg.sender,
          unreadCount: existing?.unreadCount || 0
        });
      }
      
      if (!msg.isRead) {
        const current = conversationsMap.get(otherUserId);
        conversationsMap.set(otherUserId, {
          ...current,
          unreadCount: (current.unreadCount || 0) + 1
        });
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver and content are required" },
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
            email: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        type: "NEW_MESSAGE",
        content: `${session.user.name || session.user.email} sent you a message`,
        userId: receiverId,
        actorId: session.user.id,
        actorName: session.user.name || session.user.email || "Anonymous"
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

    const whereClause: any = {
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
