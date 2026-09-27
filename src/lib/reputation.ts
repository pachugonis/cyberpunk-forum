import { prisma } from "@/lib/prisma";

import { REPUTATION_POINTS } from "@/lib/reputation-levels";

export { REPUTATION_POINTS, REPUTATION_LEVELS, getReputationLevel } from "@/lib/reputation-levels";

/**
 * Update user reputation by adding/subtracting points
 */
export async function updateUserReputation(
  userId: string,
  points: number
): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        reputation: {
          increment: points,
        },
      },
      select: { reputation: true },
    });

    // Ensure reputation doesn't go below 0
    if (user.reputation < 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { reputation: 0 },
      });
      return 0;
    }

    return user.reputation;
  } catch (error) {
    console.error("Failed to update user reputation:", error);
    return 0;
  }
}

/**
 * Award reputation for creating a topic
 */
export async function awardTopicCreationReputation(
  authorId: string
): Promise<void> {
  await updateUserReputation(authorId, REPUTATION_POINTS.TOPIC_CREATE);
}

/**
 * Award reputation for creating a comment
 */
export async function awardCommentCreationReputation(
  authorId: string
): Promise<void> {
  await updateUserReputation(authorId, REPUTATION_POINTS.COMMENT_CREATE);
}

/**
 * Award reputation for receiving a reaction on a topic
 */
export async function awardTopicReactionReputation(
  topicAuthorId: string
): Promise<void> {
  await updateUserReputation(topicAuthorId, REPUTATION_POINTS.REACTION_ON_TOPIC);
}

/**
 * Award reputation for receiving a reaction on a comment
 */
export async function awardCommentReactionReputation(
  commentAuthorId: string
): Promise<void> {
  await updateUserReputation(
    commentAuthorId,
    REPUTATION_POINTS.REACTION_ON_COMMENT
  );
}

/**
 * Deduct reputation for deleting a topic
 */
export async function deductTopicDeletionReputation(
  authorId: string
): Promise<void> {
  await updateUserReputation(authorId, REPUTATION_POINTS.TOPIC_DELETE);
}

/**
 * Deduct reputation for deleting a comment
 */
export async function deductCommentDeletionReputation(
  authorId: string
): Promise<void> {
  await updateUserReputation(authorId, REPUTATION_POINTS.COMMENT_DELETE);
}

/**
 * Remove reputation when a reaction is removed from a topic
 */
export async function removeTopicReactionReputation(
  topicAuthorId: string
): Promise<void> {
  await updateUserReputation(topicAuthorId, -REPUTATION_POINTS.REACTION_ON_TOPIC);
}

/**
 * Remove reputation when a reaction is removed from a comment
 */
export async function removeCommentReactionReputation(
  commentAuthorId: string
): Promise<void> {
  await updateUserReputation(
    commentAuthorId,
    -REPUTATION_POINTS.REACTION_ON_COMMENT
  );
}
