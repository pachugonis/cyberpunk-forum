"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Cpu, 
  Zap, 
  Shield, 
  Code, 
  Gamepad2,
  TrendingUp,
  Clock,
  LucideIcon
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  _count?: {
    topics: number;
  };
}

interface Stats {
  userCount: number;
  topicCount: number;
}

interface SidebarProps {
  categories?: Category[];
  stats?: Stats;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Cpu,
  Zap,
  Shield,
  Code,
  Gamepad2,
};

export function Sidebar({ categories = [], stats, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');
  const t = useTranslations('sidebar');

  return (
    <aside className={cn("w-64 shrink-0", className)}>
      <div className="sticky top-20 space-y-6">
        {/* Quick Links */}
        <div className="card-cyber p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            {t('navigation')}
          </h3>
          <nav className="space-y-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors rounded-none",
                pathname === "/" && !sort
                  ? "bg-[var(--cyber-cyan)]/10 text-[var(--cyber-cyan)] border-l-2 border-[var(--cyber-cyan)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Link>
            <Link
              href="/?sort=latest#topics"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors rounded-none",
                pathname === "/" && sort === "latest"
                  ? "bg-[var(--cyber-cyan)]/10 text-[var(--cyber-cyan)] border-l-2 border-[var(--cyber-cyan)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
              )}
            >
              <Clock className="h-4 w-4" />
              Latest
            </Link>
          </nav>
        </div>

        {/* Categories */}
        <div className="card-cyber p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            {t('categories')}
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon || "MessageSquare"] || MessageSquare;
              const isActive = pathname === `/category/${category.slug}`;
              const iconColor = isActive ? "var(--cyber-cyan)" : (category.color || undefined);
              
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 text-sm font-mono transition-colors rounded-none group",
                    isActive
                      ? "bg-[var(--cyber-cyan)]/10 text-[var(--cyber-cyan)] border-l-2 border-[var(--cyber-cyan)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent 
                      className="h-4 w-4" 
                      color={iconColor}
                    />
                    <span>{category.name}</span>
                  </div>
                  {category._count && (
                    <span className="text-xs opacity-60">
                      {category._count.topics}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Stats */}
        <div className="card-cyber p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Network Stats
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Online</span>
              <span className="text-[var(--cyber-cyan)]">{stats?.userCount ?? '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Topics</span>
              <span className="text-foreground">{stats?.topicCount ?? '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users</span>
              <span className="text-foreground">{stats?.userCount ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
