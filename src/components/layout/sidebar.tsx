"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface SidebarProps {
  categories?: Category[];
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

export function Sidebar({ categories = [], className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 shrink-0", className)}>
      <div className="sticky top-20 space-y-6">
        {/* Quick Links */}
        <div className="card-cyber p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Quick Access
          </h3>
          <nav className="space-y-1">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors rounded-none",
                pathname === "/"
                  ? "bg-[var(--cyber-cyan)]/10 text-[var(--cyber-cyan)] border-l-2 border-[var(--cyber-cyan)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Link>
            <Link
              href="/?sort=latest"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors rounded-none",
                pathname === "/" && "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
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
            Categories
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
              <span className="text-[var(--cyber-cyan)]">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Topics</span>
              <span className="text-foreground">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users</span>
              <span className="text-foreground">--</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
