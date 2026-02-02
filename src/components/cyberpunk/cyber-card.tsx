import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CyberCardProps {
  children: ReactNode;
  variant?: "default" | "highlighted" | "danger";
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function CyberCard({
  children,
  variant = "default",
  className,
  onClick,
  hover = true,
}: CyberCardProps) {
  const variants = {
    default: hover
      ? "border-[#2a2a35] hover:border-[var(--cyber-cyan)] hover:shadow-neon-cyan-sm"
      : "border-[#2a2a35]",
    highlighted: "border-[var(--cyber-cyan)] shadow-neon-cyan-sm",
    danger: "border-[var(--cyber-magenta)] hover:shadow-neon-magenta-sm",
  };

  return (
    <div
      className={cn(
        "card-cyber p-6 transition-all duration-300",
        variants[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
