"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Flame, Zap, Cpu, Code } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReactionButtonProps {
  targetId: string;
  targetType: "topic" | "comment";
  reactions: Array<{
    type: string;
    userId: string;
  }>;
  currentUserId?: string;
}

const reactionConfig = {
  LIKE: { icon: Heart, color: "var(--cyber-magenta)", label: "Like" },
  LOVE: { icon: Heart, color: "#ff6b6b", label: "Love" },
  FIRE: { icon: Flame, color: "var(--cyber-yellow)", label: "Fire" },
  CYBER: { icon: Cpu, color: "var(--cyber-cyan)", label: "Cyber" },
  HACK: { icon: Code, color: "var(--cyber-purple)", label: "Hack" },
};

type ReactionType = keyof typeof reactionConfig;

export function ReactionButton({ 
  targetId, 
  targetType, 
  reactions, 
  currentUserId 
}: ReactionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const t = useTranslations('reaction');

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userReactions = reactions
    .filter(r => r.userId === currentUserId)
    .map(r => r.type);

  const handleReaction = async (type: ReactionType) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          targetId,
          targetType,
        }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to react:", error);
    } finally {
      setLoading(false);
      setShowPicker(false);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 text-xs font-mono gap-1",
          userReactions.length > 0 
            ? "text-[var(--cyber-cyan)]" 
            : "text-muted-foreground hover:text-[var(--cyber-cyan)]"
        )}
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
      >
        <Zap className="h-3 w-3" />
        <span>{totalReactions || t('react')}</span>
      </Button>

      {showPicker && (
        <div
          className={cn(
            "absolute left-0 bg-[#13131a] border border-[#2a2a35] p-2 clip-cyber flex gap-1 z-50",
            targetType === "topic" ? "top-full mt-2" : "bottom-full mb-2"
          )}
        >
          {(Object.keys(reactionConfig) as ReactionType[]).map((type) => {
            const config = reactionConfig[type];
            const Icon = config.icon;
            const isActive = userReactions.includes(type);
            const count = reactionCounts[type] || 0;

            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded transition-all hover:bg-[#1a1a24]",
                  isActive && "bg-[#1a1a24]"
                )}
                title={config.label}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform hover:scale-110",
                    isActive && "fill-current"
                  )}
                  style={{ color: config.color }}
                />
                {count > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
