"use client";

import Link from "next/link";
import { GlitchText } from "@/components/cyberpunk";
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-[#2a2a35] bg-[#0a0a0f] mt-auto">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[var(--cyber-cyan)] clip-cyber flex items-center justify-center">
                <span className="text-[#0a0a0f] font-bold text-sm">NC</span>
              </div>
              <GlitchText
                text="NIGHTCITY"
                className="text-lg font-bold text-[var(--cyber-cyan)]"
              />
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--cyber-cyan)] mb-4">
              Navigate
            </h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground font-mono transition-colors">
                Home
              </Link>
              <Link href="/search" className="block text-sm text-muted-foreground hover:text-foreground font-mono transition-colors">
                Search
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--cyber-magenta)] mb-4">
              Community
            </h4>
            <nav className="space-y-2">
              <Link href="/register" className="block text-sm text-muted-foreground hover:text-foreground font-mono transition-colors">
                Join Network
              </Link>
              <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground font-mono transition-colors">
                Jack In
              </Link>
            </nav>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--cyber-yellow)] mb-4">
              System Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--cyber-cyan)] animate-pulse" />
                <span className="text-sm text-muted-foreground font-mono">Network Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--cyber-cyan)]" />
                <span className="text-sm text-muted-foreground font-mono">Database Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#2a2a35]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-mono">
              2077 NIGHTCITY FORUM. ALL RIGHTS RESERVED.
            </p>
            <p className="text-xs text-muted-foreground font-mono opacity-50">
              v2.0.77 // SECURE CONNECTION
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
