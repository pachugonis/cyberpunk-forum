import { prisma } from "@/lib/prisma";
import { 
  Trophy, 
  MessageSquare, 
  Heart, 
  Flame, 
  Zap, 
  Star, 
  Award,
  Crown,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  Lightbulb
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Badge types and their criteria for the cyberpunk forum
 */
export enum BadgeType {
  // Posting Activity Badges
  FIRST_TOPIC = "FIRST_TOPIC",
  TOPIC_STARTER = "TOPIC_STARTER",
  TOPIC_MASTER = "TOPIC_MASTER",
  TOPIC_LEGEND = "TOPIC_LEGEND",
  
  FIRST_COMMENT = "FIRST_COMMENT",
  COMMENTATOR = "COMMENTATOR",
  CONVERSATION_MASTER = "CONVERSATION_MASTER",
  
  // Reaction Badges
  POPULAR = "POPULAR",
  INFLUENCER = "INFLUENCER",
  VIRAL = "VIRAL",
  
  // Reputation Badges
  RISING_STAR = "RISING_STAR",
  VETERAN = "VETERAN",
  LEGEND = "LEGEND",
  
  // Engagement Badges
  EARLY_ADOPTER = "EARLY_ADOPTER",
  ACTIVE_MEMBER = "ACTIVE_MEMBER",
  DEDICATED = "DEDICATED",
  
  // Special Badges
  HELPFUL = "HELPFUL",
  DISCUSSION_STARTER = "DISCUSSION_STARTER",
  COMMUNITY_BUILDER = "COMMUNITY_BUILDER",
}

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  criteria: (userId: string) => Promise<boolean>;
}

/**
 * Badge definitions with their criteria
 */
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  // === POSTING ACTIVITY BADGES ===
  [BadgeType.FIRST_TOPIC]: {
    type: BadgeType.FIRST_TOPIC,
    name: "First Post",
    description: "Created your first topic",
    icon: BookOpen,
    color: "#60A5FA",
    rarity: "common",
    criteria: async (userId: string) => {
      const count = await prisma.topic.count({
        where: { authorId: userId },
      });
      return count >= 1;
    },
  },
  [BadgeType.TOPIC_STARTER]: {
    type: BadgeType.TOPIC_STARTER,
    name: "Topic Starter",
    description: "Created 10 topics",
    icon: Lightbulb,
    color: "#34D399",
    rarity: "common",
    criteria: async (userId: string) => {
      const count = await prisma.topic.count({
        where: { authorId: userId },
      });
      return count >= 10;
    },
  },
  [BadgeType.TOPIC_MASTER]: {
    type: BadgeType.TOPIC_MASTER,
    name: "Topic Master",
    description: "Created 50 topics",
    icon: Target,
    color: "#A78BFA",
    rarity: "rare",
    criteria: async (userId: string) => {
      const count = await prisma.topic.count({
        where: { authorId: userId },
      });
      return count >= 50;
    },
  },
  [BadgeType.TOPIC_LEGEND]: {
    type: BadgeType.TOPIC_LEGEND,
    name: "Topic Legend",
    description: "Created 100 topics",
    icon: Crown,
    color: "#FBBF24",
    rarity: "legendary",
    criteria: async (userId: string) => {
      const count = await prisma.topic.count({
        where: { authorId: userId },
      });
      return count >= 100;
    },
  },
  
  // === COMMENT BADGES ===
  [BadgeType.FIRST_COMMENT]: {
    type: BadgeType.FIRST_COMMENT,
    name: "First Words",
    description: "Posted your first comment",
    icon: MessageSquare,
    color: "#60A5FA",
    rarity: "common",
    criteria: async (userId: string) => {
      const count = await prisma.comment.count({
        where: { authorId: userId },
      });
      return count >= 1;
    },
  },
  [BadgeType.COMMENTATOR]: {
    type: BadgeType.COMMENTATOR,
    name: "Commentator",
    description: "Posted 50 comments",
    icon: MessageSquare,
    color: "#34D399",
    rarity: "common",
    criteria: async (userId: string) => {
      const count = await prisma.comment.count({
        where: { authorId: userId },
      });
      return count >= 50;
    },
  },
  [BadgeType.CONVERSATION_MASTER]: {
    type: BadgeType.CONVERSATION_MASTER,
    name: "Conversation Master",
    description: "Posted 200 comments",
    icon: Users,
    color: "#A78BFA",
    rarity: "rare",
    criteria: async (userId: string) => {
      const count = await prisma.comment.count({
        where: { authorId: userId },
      });
      return count >= 200;
    },
  },
  
  // === REACTION BADGES ===
  [BadgeType.POPULAR]: {
    type: BadgeType.POPULAR,
    name: "Popular",
    description: "Received 50 reactions on your posts",
    icon: Heart,
    color: "#F472B6",
    rarity: "common",
    criteria: async (userId: string) => {
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
  },
  [BadgeType.INFLUENCER]: {
    type: BadgeType.INFLUENCER,
    name: "Influencer",
    description: "Received 200 reactions on your posts",
    icon: Sparkles,
    color: "#A78BFA",
    rarity: "rare",
    criteria: async (userId: string) => {
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
  },
  [BadgeType.VIRAL]: {
    type: BadgeType.VIRAL,
    name: "Viral",
    description: "Received 500 reactions on your posts",
    icon: Flame,
    color: "#EF4444",
    rarity: "legendary",
    criteria: async (userId: string) => {
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
  },
  
  // === REPUTATION BADGES ===
  [BadgeType.RISING_STAR]: {
    type: BadgeType.RISING_STAR,
    name: "Rising Star",
    description: "Reached 100 reputation points",
    icon: Star,
    color: "#FBBF24",
    rarity: "common",
    criteria: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true },
      });
      return (user?.reputation || 0) >= 100;
    },
  },
  [BadgeType.VETERAN]: {
    type: BadgeType.VETERAN,
    name: "Veteran",
    description: "Reached 500 reputation points",
    icon: Shield,
    color: "#A78BFA",
    rarity: "rare",
    criteria: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true },
      });
      return (user?.reputation || 0) >= 500;
    },
  },
  [BadgeType.LEGEND]: {
    type: BadgeType.LEGEND,
    name: "Legend",
    description: "Reached 1000 reputation points",
    icon: Trophy,
    color: "#EF4444",
    rarity: "legendary",
    criteria: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation: true },
      });
      return (user?.reputation || 0) >= 1000;
    },
  },
  
  // === ENGAGEMENT BADGES ===
  [BadgeType.EARLY_ADOPTER]: {
    type: BadgeType.EARLY_ADOPTER,
    name: "Early Adopter",
    description: "Joined in the first month",
    icon: Zap,
    color: "#FBBF24",
    rarity: "rare",
    criteria: async (userId: string) => {
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
  },
  [BadgeType.ACTIVE_MEMBER]: {
    type: BadgeType.ACTIVE_MEMBER,
    name: "Active Member",
    description: "Active for 30 days",
    icon: Clock,
    color: "#34D399",
    rarity: "common",
    criteria: async (userId: string) => {
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
  },
  [BadgeType.DEDICATED]: {
    type: BadgeType.DEDICATED,
    name: "Dedicated",
    description: "Active for 6 months",
    icon: Award,
    color: "#A78BFA",
    rarity: "rare",
    criteria: async (userId: string) => {
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
  },
  
  // === SPECIAL BADGES ===
  [BadgeType.HELPFUL]: {
    type: BadgeType.HELPFUL,
    name: "Helpful",
    description: "Received 100 reactions on comments",
    icon: Heart,
    color: "#F472B6",
    rarity: "rare",
    criteria: async (userId: string) => {
      const commentReactions = await prisma.reaction.count({
        where: {
          comment: {
            authorId: userId,
          },
        },
      });
      return commentReactions >= 100;
    },
  },
  [BadgeType.DISCUSSION_STARTER]: {
    type: BadgeType.DISCUSSION_STARTER,
    name: "Discussion Starter",
    description: "Created topics with 500+ total comments",
    icon: TrendingUp,
    color: "#34D399",
    rarity: "rare",
    criteria: async (userId: string) => {
      const topics = await prisma.topic.findMany({
        where: { authorId: userId },
        include: {
          _count: {
            select: { comments: true },
          },
        },
      });
      const totalComments = topics.reduce((sum, topic) => sum + topic._count.comments, 0);
      return totalComments >= 500;
    },
  },
  [BadgeType.COMMUNITY_BUILDER]: {
    type: BadgeType.COMMUNITY_BUILDER,
    name: "Community Builder",
    description: "100 topics and 300 comments",
    icon: Users,
    color: "#EF4444",
    rarity: "legendary",
    criteria: async (userId: string) => {
      const topicCount = await prisma.topic.count({
        where: { authorId: userId },
      });
      const commentCount = await prisma.comment.count({
        where: { authorId: userId },
      });
      return topicCount >= 100 && commentCount >= 300;
    },
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
  
  // Check each badge type
  for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
    // Skip if user already has this badge
    if (existingBadgeTypes.has(badgeType)) {
      continue;
    }
    
    // Check if criteria is met
    try {
      const earned = await definition.criteria(userId);
      if (earned) {
        // Award the badge
        await prisma.badge.create({
          data: {
            userId,
            badgeType,
          },
        });
        newBadges.push(badgeType);
      }
    } catch (error) {
      console.error(`Error checking badge ${badgeType} for user ${userId}:`, error);
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
