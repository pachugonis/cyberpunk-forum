"use client";

import { getReputationLevel } from "@/lib/reputation";
import { Trophy } from "lucide-react";

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center px-2 py-1 text-xs font-mono font-bold border rounded"
        style={{ borderColor: level.color, color: level.color }}
      >
        <Trophy className="h-3 w-3 mr-1" />
        {level.name}
      </div>
      {showPoints && (
        <span
          className="text-xs font-mono font-bold"
          style={{ color: level.color }}
        >
          {reputation} pts
        </span>
      )}
    </div>
  );
}
