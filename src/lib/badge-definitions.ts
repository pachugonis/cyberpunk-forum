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
 * Badge types and display metadata for the cyberpunk forum.
 * Kept free of server-only imports so client components can use it;
 * award criteria live in lib/badges.ts.
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
}

/**
 * Badge definitions with their criteria
 */
/**
 * Badge definitions (display metadata)
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
  },
  [BadgeType.TOPIC_STARTER]: {
    type: BadgeType.TOPIC_STARTER,
    name: "Topic Starter",
    description: "Created 10 topics",
    icon: Lightbulb,
    color: "#34D399",
    rarity: "common",
  },
  [BadgeType.TOPIC_MASTER]: {
    type: BadgeType.TOPIC_MASTER,
    name: "Topic Master",
    description: "Created 50 topics",
    icon: Target,
    color: "#A78BFA",
    rarity: "rare",
  },
  [BadgeType.TOPIC_LEGEND]: {
    type: BadgeType.TOPIC_LEGEND,
    name: "Topic Legend",
    description: "Created 100 topics",
    icon: Crown,
    color: "#FBBF24",
    rarity: "legendary",
  },
  
  // === COMMENT BADGES ===
  [BadgeType.FIRST_COMMENT]: {
    type: BadgeType.FIRST_COMMENT,
    name: "First Words",
    description: "Posted your first comment",
    icon: MessageSquare,
    color: "#60A5FA",
    rarity: "common",
  },
  [BadgeType.COMMENTATOR]: {
    type: BadgeType.COMMENTATOR,
    name: "Commentator",
    description: "Posted 50 comments",
    icon: MessageSquare,
    color: "#34D399",
    rarity: "common",
  },
  [BadgeType.CONVERSATION_MASTER]: {
    type: BadgeType.CONVERSATION_MASTER,
    name: "Conversation Master",
    description: "Posted 200 comments",
    icon: Users,
    color: "#A78BFA",
    rarity: "rare",
  },
  
  // === REACTION BADGES ===
  [BadgeType.POPULAR]: {
    type: BadgeType.POPULAR,
    name: "Popular",
    description: "Received 50 reactions on your posts",
    icon: Heart,
    color: "#F472B6",
    rarity: "common",
  },
  [BadgeType.INFLUENCER]: {
    type: BadgeType.INFLUENCER,
    name: "Influencer",
    description: "Received 200 reactions on your posts",
    icon: Sparkles,
    color: "#A78BFA",
    rarity: "rare",
  },
  [BadgeType.VIRAL]: {
    type: BadgeType.VIRAL,
    name: "Viral",
    description: "Received 500 reactions on your posts",
    icon: Flame,
    color: "#EF4444",
    rarity: "legendary",
  },
  
  // === REPUTATION BADGES ===
  [BadgeType.RISING_STAR]: {
    type: BadgeType.RISING_STAR,
    name: "Rising Star",
    description: "Reached 100 reputation points",
    icon: Star,
    color: "#FBBF24",
    rarity: "common",
  },
  [BadgeType.VETERAN]: {
    type: BadgeType.VETERAN,
    name: "Veteran",
    description: "Reached 500 reputation points",
    icon: Shield,
    color: "#A78BFA",
    rarity: "rare",
  },
  [BadgeType.LEGEND]: {
    type: BadgeType.LEGEND,
    name: "Legend",
    description: "Reached 1000 reputation points",
    icon: Trophy,
    color: "#EF4444",
    rarity: "legendary",
  },
  
  // === ENGAGEMENT BADGES ===
  [BadgeType.EARLY_ADOPTER]: {
    type: BadgeType.EARLY_ADOPTER,
    name: "Early Adopter",
    description: "Joined in the first month",
    icon: Zap,
    color: "#FBBF24",
    rarity: "rare",
  },
  [BadgeType.ACTIVE_MEMBER]: {
    type: BadgeType.ACTIVE_MEMBER,
    name: "Active Member",
    description: "Active for 30 days",
    icon: Clock,
    color: "#34D399",
    rarity: "common",
  },
  [BadgeType.DEDICATED]: {
    type: BadgeType.DEDICATED,
    name: "Dedicated",
    description: "Active for 6 months",
    icon: Award,
    color: "#A78BFA",
    rarity: "rare",
  },
  
  // === SPECIAL BADGES ===
  [BadgeType.HELPFUL]: {
    type: BadgeType.HELPFUL,
    name: "Helpful",
    description: "Received 100 reactions on comments",
    icon: Heart,
    color: "#F472B6",
    rarity: "rare",
  },
  [BadgeType.DISCUSSION_STARTER]: {
    type: BadgeType.DISCUSSION_STARTER,
    name: "Discussion Starter",
    description: "Created topics with 500+ total comments",
    icon: TrendingUp,
    color: "#34D399",
    rarity: "rare",
  },
  [BadgeType.COMMUNITY_BUILDER]: {
    type: BadgeType.COMMUNITY_BUILDER,
    name: "Community Builder",
    description: "100 topics and 300 comments",
    icon: Users,
    color: "#EF4444",
    rarity: "legendary",
  },
};
