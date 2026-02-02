import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HologramBadgeProps {
  children: React.ReactNode;
  variant?: "admin" | "moderator" | "user" | "verified";
  className?: string;
}

export function HologramBadge({
  children,
  variant = "user",
  className,
}: HologramBadgeProps) {
  const variants = {
    admin: "bg-[var(--cyber-magenta)]/20 text-[var(--cyber-magenta)] border-[var(--cyber-magenta)] shadow-[0_0_5px_var(--cyber-magenta)]",
    moderator: "bg-[var(--cyber-yellow)]/20 text-[var(--cyber-yellow)] border-[var(--cyber-yellow)] shadow-[0_0_5px_var(--cyber-yellow)]",
    user: "bg-[var(--cyber-cyan)]/20 text-[var(--cyber-cyan)] border-[var(--cyber-cyan)]",
    verified: "bg-[var(--cyber-purple)]/20 text-[var(--cyber-purple)] border-[var(--cyber-purple)] shadow-[0_0_5px_var(--cyber-purple)]",
  };

  return (
    <Badge
      className={cn(
        "font-mono text-xs uppercase tracking-wider border hologram",
        variants[variant],
        className
      )}
    >
      {children}
    </Badge>
  );
}
