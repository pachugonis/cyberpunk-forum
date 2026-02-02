import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TechGridBgProps {
  children: ReactNode;
  className?: string;
  withScanLines?: boolean;
}

export function TechGridBg({
  children,
  className,
  withScanLines = true,
}: TechGridBgProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      {withScanLines && <div className="scan-lines absolute inset-0 pointer-events-none" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
