import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse an integer query param, falling back to `fallback` and clamping to [min, max]
 */
export function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = parseInt(value ?? "", 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

/**
 * Generate a recovery code in format XXXX-XXXX-XXXX-XXXX
 * Uses alphanumeric characters (excluding ambiguous ones like 0, O, I, l)
 */
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 4;
  
  const code = Array.from({ length: segments }, () => {
    return Array.from({ length: segmentLength }, () => 
      chars.charAt(crypto.getRandomValues(new Uint32Array(1))[0] % chars.length)
    ).join('');
  });
  
  return code.join('-');
}
