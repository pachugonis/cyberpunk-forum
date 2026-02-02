import Link from "next/link";
import { CyberCard } from "@/components/cyberpunk";
import { MessageSquare, Cpu, Zap, Shield, Code, Gamepad2, LucideIcon } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    _count?: {
      topics: number;
    };
  };
}

const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Cpu,
  Zap,
  Shield,
  Code,
  Gamepad2,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon || "MessageSquare"] || MessageSquare;
  const iconColor = category.color || "var(--cyber-cyan)";
  
  return (
    <Link href={`/category/${category.slug}`}>
      <CyberCard className="h-full group">
        <div className="flex items-start gap-4">
          <div 
            className="h-12 w-12 flex items-center justify-center clip-cyber shrink-0"
            style={{ backgroundColor: `${category.color || "#00f0ff"}20` }}
          >
            <IconComponent 
              className="h-6 w-6 group-hover:animate-pulse"
              color={iconColor}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--cyber-cyan)] transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 font-mono">
              {category.description || "No description"}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>{category._count?.topics || 0} topics</span>
            </div>
          </div>
        </div>
      </CyberCard>
    </Link>
  );
}
