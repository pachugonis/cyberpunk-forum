import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NeonBorderProps {
  children: ReactNode;
  color?: "cyan" | "magenta" | "yellow";
  className?: string;
  pulse?: boolean;
}

export function NeonBorder({
  children,
  color = "cyan",
  className,
  pulse = false,
}: NeonBorderProps) {
  const colorClasses = {
    cyan: "neon-border-cyan",
    magenta: "neon-border-magenta",
    yellow: "border-[var(--cyber-yellow)] shadow-[0_0_5px_var(--cyber-yellow)]",
  };

  return (
    <div
      className={cn(
        colorClasses[color],
        pulse && "animate-glow-pulse",
        className
      )}
    >
      {children}
    </div>
  );
}
