"use client";

import { BADGE_DEFINITIONS, BadgeType } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { getDateFnsLocale } from "@/lib/date-locale";

interface UserBadgeProps {
  badgeType: BadgeType;
  earnedAt?: Date;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function UserBadge({
  badgeType,
  earnedAt,
  size = "md",
  showTooltip = true,
  className = "",
}: UserBadgeProps) {
  const definition = BADGE_DEFINITIONS[badgeType];
  const t = useTranslations('badges.types');
  const tBadges = useTranslations('badges');
  const locale = useLocale();
  const dateLocale = getDateFnsLocale(locale);

  if (!definition) {
    return null;
  }

  const Icon = definition.icon;

  const sizeClasses = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-12 w-12 p-2",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const rarityClasses = {
    common: "border-[#60A5FA] shadow-[0_0_10px_rgba(96,165,250,0.3)]",
    rare: "border-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.3)]",
    epic: "border-[#F472B6] shadow-[0_0_15px_rgba(244,114,182,0.4)]",
    legendary: "border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse",
  };

  return (
    <div
      className={cn(
        "group relative inline-flex",
        className
      )}
    >
      <div
        className={cn(
          "rounded-lg border-2 bg-[#0a0a0f] backdrop-blur-sm transition-all duration-300",
          "hover:scale-110 cursor-pointer",
          sizeClasses[size],
          rarityClasses[definition.rarity]
        )}
        style={{ borderColor: definition.color }}
      >
        <Icon
          className={cn(iconSizeClasses[size])}
          style={{ color: definition.color }}
        />
      </div>

      {showTooltip && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2",
            "bg-[#0a0a0f] border border-[#2a2a35] rounded-lg",
            "opacity-0 group-hover:opacity-100 pointer-events-none",
            "transition-opacity duration-200 z-50 whitespace-nowrap",
            "shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          )}
        >
          <div className="text-xs font-mono space-y-1">
            <div
              className="font-bold"
              style={{ color: definition.color }}
            >
              {t(`${badgeType}.name`)}
            </div>
            <div className="text-muted-foreground">
              {t(`${badgeType}.description`)}
            </div>
            {earnedAt && (
              <div className="text-[10px] text-[var(--cyber-cyan)] pt-1 border-t border-[#2a2a35]">
                {tBadges('earned')} {formatDistanceToNow(earnedAt, { addSuffix: true, locale: dateLocale })}
              </div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #2a2a35",
            }}
          />
        </div>
      )}
    </div>
  );
}

interface BadgeListProps {
  badges: Array<{
    badgeType: string;
    earnedAt: Date;
  }>;
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BadgeList({
  badges,
  maxDisplay,
  size = "md",
  className = "",
}: BadgeListProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay 
    ? badges.length - maxDisplay 
    : 0;
  const t = useTranslations('badges');

  if (badges.length === 0) {
    return (
      <div className="text-sm text-muted-foreground font-mono italic">
        {t('noBadges')}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {displayBadges.map((badge) => (
        <UserBadge
          key={badge.badgeType}
          badgeType={badge.badgeType as BadgeType}
          earnedAt={badge.earnedAt}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div className="text-xs font-mono text-muted-foreground px-2 py-1 bg-[#1a1a24] border border-[#2a2a35] rounded">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}

interface BadgeStatsProps {
  stats: {
    total: number;
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  className?: string;
}

export function BadgeStats({ stats, className = "" }: BadgeStatsProps) {
  const t = useTranslations('badges.stats');
  
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-3", className)}>
      <div className="bg-[#0a0a0f] border border-[#2a2a35] rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-[var(--cyber-cyan)]">
          {stats.total}
        </div>
        <div className="text-xs text-muted-foreground font-mono">{t('total')}</div>
      </div>
      <div className="bg-[#0a0a0f] border border-[#2a2a35] rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-[#60A5FA]">{stats.common}</div>
        <div className="text-xs text-muted-foreground font-mono">{t('common')}</div>
      </div>
      <div className="bg-[#0a0a0f] border border-[#2a2a35] rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-[#A78BFA]">{stats.rare}</div>
        <div className="text-xs text-muted-foreground font-mono">{t('rare')}</div>
      </div>
      <div className="bg-[#0a0a0f] border border-[#2a2a35] rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-[#F472B6]">{stats.epic}</div>
        <div className="text-xs text-muted-foreground font-mono">{t('epic')}</div>
      </div>
      <div className="bg-[#0a0a0f] border border-[#2a2a35] rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-[#FBBF24]">
          {stats.legendary}
        </div>
        <div className="text-xs text-muted-foreground font-mono">{t('legendary')}</div>
      </div>
    </div>
  );
}
