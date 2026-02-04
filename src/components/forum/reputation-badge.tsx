"use client";

import { getReputationLevel } from "@/lib/reputation";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReputationBadgeProps {
  reputation: number;
  showPoints?: boolean;
  className?: string;
}

export function ReputationBadge({
  reputation,
  showPoints = true,
  className = "",
}: ReputationBadgeProps) {
  const level = getReputationLevel(reputation);
  const t = useTranslations('reputation.levels');
  const tProfile = useTranslations('profile');
  
  // Map English level names to translation keys
  const levelKeyMap: Record<string, string> = {
    "Newbie": "newbie",
    "Regular": "regular",
    "Contributor": "contributor",
    "Veteran": "veteran",
    "Elite": "elite",
    "Legend": "legend",
  };
  
  const translatedLevelName = t(levelKeyMap[level.name] || 'newbie');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center px-2 py-1 text-xs font-mono font-bold border rounded"
        style={{ borderColor: level.color, color: level.color }}
      >
        <Trophy className="h-3 w-3 mr-1" />
        {translatedLevelName}
      </div>
      {showPoints && (
        <span
          className="text-xs font-mono font-bold"
          style={{ color: level.color }}
        >
          {reputation} {tProfile('reputationPoints')}
        </span>
      )}
    </div>
  );
}
