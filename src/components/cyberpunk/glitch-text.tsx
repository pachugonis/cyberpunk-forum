"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  style?: CSSProperties;
}

export function GlitchText({ text, className, as: Component = "span", style }: GlitchTextProps) {
  return (
    <Component
      className={cn("glitch-text", className)}
      data-text={text}
      style={style}
    >
      {text}
    </Component>
  );
}
