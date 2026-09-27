import { prisma } from "@/lib/prisma";
import { BADGE_DEFINITIONS, BadgeType } from "@/lib/badge-definitions";

export { BADGE_DEFINITIONS, BadgeType } from "@/lib/badge-definitions";
export type { BadgeDefinition } from "@/lib/badge-definitions";

/**
 * Award criteria for each badge (server only)
 */
const BADGE_CRITERIA: Record<BadgeType, (userId: string) => Promise<boolean>> = {
  [BadgeType.FIRST_TOPIC]: async (userId: string) => {
    const count = await prisma.topic.count({
      where: { authorId: userId },
    });
    return count >= 1;
  },
  [BadgeType.TOPIC_STARTER]: async (userId: string) => {
    const count = await prisma.topic.count({
      where: { authorId: userId },
    });
    return count >= 10;
  },
  [BadgeType.TOPIC_MASTER]: async (userId: string) => {
    const count = await prisma.topic.count({
      where: { authorId: userId },
    });
    return count >= 50;
  },
  [BadgeType.TOPIC_LEGEND]: async (userId: string) => {
    const count = await prisma.topic.count({
      where: { authorId: userId },
    });
    return count >= 100;
  },
  [BadgeType.FIRST_COMMENT]: async (userId: string) => {
    const count = await prisma.comment.count({
      where: { authorId: userId },
    });
    return count >= 1;
  },
  [BadgeType.COMMENTATOR]: async (userId: string) => {
    const count = await prisma.comment.count({
      where: { authorId: userId },
    });
    return count >= 50;
  },
  [BadgeType.CONVERSATION_MASTER]: async (userId: string) => {
    const count = await prisma.comment.count({
      where: { authorId: userId },
    });
    return count >= 200;
  },
  [BadgeType.POPULAR]: async (userId: string) => {
    const topicReactions = await prisma.reaction.count({
      where: {
        topic: {
          authorId: userId,
        },
      },
    });
    const commentReactions = await prisma.reaction.count({
      where: {
        comment: {
          authorId: userId,
        },
      },
    });
    return topicReactions + commentReactions >= 50;
  },
  [BadgeType.INFLUENCER]: async (userId: string) => {
    const topicReactions = await prisma.reaction.count({
      where: {
        topic: {
          authorId: userId,
        },
      },
    });
    const commentReactions = await prisma.reaction.count({
      where: {
        comment: {
          authorId: userId,
        },
      },
    });
    return topicReactions + commentReactions >= 200;
  },
  [BadgeType.VIRAL]: async (userId: string) => {
    const topicReactions = await prisma.reaction.count({
      where: {
        topic: {
          authorId: userId,
        },
      },
    });
    const commentReactions = await prisma.reaction.count({
      where: {
        comment: {
          authorId: userId,
        },
      },
    });
    return topicReactions + commentReactions >= 500;
  },
  [BadgeType.RISING_STAR]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true },
    });
    return (user?.reputation || 0) >= 100;
  },
  [BadgeType.VETERAN]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true },
    });
    return (user?.reputation || 0) >= 500;
  },
  [BadgeType.LEGEND]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true },
    });
    return (user?.reputation || 0) >= 1000;
  },
  [BadgeType.EARLY_ADOPTER]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return false;
    
    // Check if user joined within 30 days of the first user
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (!firstUser) return false;
    
    const daysDiff = Math.floor(
      (user.createdAt.getTime() - firstUser.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 30;
  },
  [BadgeType.ACTIVE_MEMBER]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return false;
    
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceJoined >= 30;
  },
  [BadgeType.DEDICATED]: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return false;
    
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceJoined >= 180;
  },
  [BadgeType.HELPFUL]: async (userId: string) => {
    const commentReactions = await prisma.reaction.count({
      where: {
        comment: {
          authorId: userId,
        },
      },
    });
    return commentReactions >= 100;
  },
  [BadgeType.DISCUSSION_STARTER]: async (userId: string) => {
    const totalComments = await prisma.comment.count({
      where: { topic: { authorId: userId } },
    });
    return totalComments >= 500;
  },
  [BadgeType.COMMUNITY_BUILDER]: async (userId: string) => {
    const topicCount = await prisma.topic.count({
      where: { authorId: userId },
    });
    const commentCount = await prisma.comment.count({
      where: { authorId: userId },
    });
    return topicCount >= 100 && commentCount >= 300;
  },
};

/**
 * Check all badges for a user and award any that are earned
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];
  
  // Get existing badges for the user
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { badgeType: true },
  });
  const existingBadgeTypes = new Set(existingBadges.map((b) => b.badgeType));
  
  // Check all not-yet-earned badges in parallel
  const pending = Object.entries(BADGE_CRITERIA).filter(
    ([badgeType]) => !existingBadgeTypes.has(badgeType)
  );
  const results = await Promise.all(
    pending.map(async ([badgeType, criteria]) => {
      try {
        return (await criteria(userId)) ? badgeType : null;
      } catch (error) {
        console.error(`Error checking badge ${badgeType} for user ${userId}:`, error);
        return null;
      }
    })
  );

  for (const badgeType of results) {
    if (!badgeType) continue;
    try {
      // Award the badge
      await prisma.badge.create({
        data: {
          userId,
          badgeType: badgeType as BadgeType,
        },
      });
      newBadges.push(badgeType);
    } catch (error) {
      console.error(`Error awarding badge ${badgeType} for user ${userId}:`, error);
    }
  }
  
  return newBadges;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
  });
  
  return badges.map((badge) => ({
    ...badge,
    definition: BADGE_DEFINITIONS[badge.badgeType as BadgeType],
  }));
}

/**
 * Get badge statistics for a user
 */
export async function getUserBadgeStats(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { userId },
  });

  return summarizeBadges(badges);
}

/**
 * Count badges by rarity (for badges that are already loaded)
 */
export function summarizeBadges(badges: { badgeType: string }[]) {
  const stats = {
    total: badges.length,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };
  
  badges.forEach((badge) => {
    const definition = BADGE_DEFINITIONS[badge.badgeType as BadgeType];
    if (definition) {
      stats[definition.rarity]++;
    }
  });
  
  return stats;
}
