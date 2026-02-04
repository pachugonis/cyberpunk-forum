# User Reputation System Implementation

## Overview
A comprehensive reputation system has been implemented for the Cyberpunk Forum that rewards user engagement and quality contributions.

## Features

### Reputation Points System
Users earn or lose reputation points based on their activities:

**Earning Points:**
- Creating a topic: **+10 points**
- Creating a comment: **+5 points**
- Receiving a reaction on a topic: **+3 points**
- Receiving a reaction on a comment: **+2 points**

**Losing Points:**
- Deleting a topic: **-15 points**
- Deleting a comment: **-10 points**
- Removing a reaction from topic/comment: removes previously awarded points

### Reputation Levels
Users are categorized into levels based on their total reputation:

| Level | Points Range | Color |
|-------|-------------|-------|
| Newbie | 0-49 | Gray (#6B7280) |
| Regular | 50-149 | Blue (#3B82F6) |
| Contributor | 150-299 | Green (#10B981) |
| Veteran | 300-499 | Purple (#8B5CF6) |
| Elite | 500-999 | Orange (#F59E0B) |
| Legend | 1000+ | Red (#EF4444) |

## Implementation Details

### Database Schema
Added `reputation` field to the User model:
```prisma
model User {
  ...
  reputation Int @default(0)
  ...
}
```

### Core Library (`src/lib/reputation.ts`)
Contains all reputation logic:
- `REPUTATION_POINTS` - Constants for point values
- `REPUTATION_LEVELS` - Level definitions with colors
- `getReputationLevel()` - Get user's current level
- `updateUserReputation()` - Update user's reputation score
- Award functions for different actions
- Deduct functions for deletions
- Remove functions for reaction removal

### API Integration
Reputation hooks integrated into:
- **Topics API** (`/api/topics/route.ts`) - Awards points on topic creation
- **Comments API** (`/api/topics/[id]/comments/route.ts`) - Awards points on comment creation
- **Reactions API** (`/api/reactions/route.ts`) - Awards/removes points for reactions
- **Topic Delete** (`/api/topics/[id]/route.ts`) - Deducts points on deletion
- **Comment Delete** (`/api/comments/[id]/route.ts`) - Deducts points on deletion

### UI Components

#### ReputationBadge Component
Location: `src/components/forum/reputation-badge.tsx`
- Displays user's reputation level with color-coded badge
- Shows reputation points
- Includes trophy icon
- Customizable display options

#### Profile Page Integration
- Shows reputation badge alongside user role
- Displays in user profile header
- Color-coded based on reputation level

### Internationalization
Translations added for both English and Russian:

**English** (`messages/en.json`):
- Reputation level names
- Point descriptions
- UI labels

**Russian** (`messages/ru.json`):
- Reputation level names (Новичок, Обычный, Участник, Ветеран, Элита, Легенда)
- Point descriptions
- UI labels

## User Experience

### Visual Feedback
- Reputation badges use dynamic colors based on level
- Trophy icon indicates achievement status
- Points displayed prominently in profile

### Progression System
Users are motivated to:
1. Create quality topics and comments
2. Engage with community through reactions
3. Maintain content (avoiding deletions)
4. Progress through reputation levels

### Safety Features
- Reputation cannot go below 0
- All operations are atomic and safe
- Failed operations are logged but don't crash the system

## Future Enhancements
Potential improvements:
- Reputation-based permissions (e.g., higher reputation users can moderate)
- Leaderboard showing top users by reputation
- Special badges/achievements at milestone levels
- Reputation history/activity log
- Weekly/monthly reputation gains tracking

## Technical Notes
- Uses Prisma ORM for database operations
- Implements optimistic UI updates
- All reputation changes are server-side for security
- Minimal reputation cannot go negative
- Async/await error handling throughout
