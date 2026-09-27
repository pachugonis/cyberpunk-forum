// Pure reputation constants and helpers, safe to import from client components.
// Database updates live in lib/reputation.ts.

/**
 * Reputation point system for the cyberpunk forum
 * 
 * Point values:
 * - Creating a topic: +10 points
 * - Creating a comment: +5 points
 * - Receiving a reaction on topic: +3 points
 * - Receiving a reaction on comment: +2 points
 * - Having your topic deleted: -15 points
 * - Having your comment deleted: -10 points
 */

export const REPUTATION_POINTS = {
  TOPIC_CREATE: 10,
  COMMENT_CREATE: 5,
  REACTION_ON_TOPIC: 3,
  REACTION_ON_COMMENT: 2,
  TOPIC_DELETE: -15,
  COMMENT_DELETE: -10,
} as const;

/**
 * Reputation levels based on total points
 */
export const REPUTATION_LEVELS = [
  { min: 0, max: 49, name: "Newbie", color: "#6B7280" },
  { min: 50, max: 149, name: "Regular", color: "#3B82F6" },
  { min: 150, max: 299, name: "Contributor", color: "#10B981" },
  { min: 300, max: 499, name: "Veteran", color: "#8B5CF6" },
  { min: 500, max: 999, name: "Elite", color: "#F59E0B" },
  { min: 1000, max: Infinity, name: "Legend", color: "#EF4444" },
] as const;

/**
 * Get reputation level information based on points
 */
export function getReputationLevel(points: number) {
  const level = REPUTATION_LEVELS.find(
    (level) => points >= level.min && points <= level.max
  );
  return level || REPUTATION_LEVELS[0];
}
