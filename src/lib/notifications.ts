import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  content: string;
  actorId?: string;
  actorName?: string;
  topicId?: string;
  commentId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Don't create notification if user is notifying themselves
    if (params.userId === params.actorId) {
      return null;
    }

    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        content: params.content,
        actorId: params.actorId,
        actorName: params.actorName,
        topicId: params.topicId,
        commentId: params.commentId,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
