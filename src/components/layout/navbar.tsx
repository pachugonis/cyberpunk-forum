"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlitchText } from "@/components/cyberpunk";
import { LanguageSwitcher, NotificationBell } from "@/components/layout";
import { Search, Menu, LogOut, User, Shield, MessageSquare } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a35] bg-[#0a0a0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0f]/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[var(--cyber-cyan)]"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[var(--cyber-cyan)] clip-cyber flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-sm">NC</span>
            </div>
            <GlitchText
              text="NIGHTCITY"
              className="text-xl font-bold text-[var(--cyber-cyan)] hidden sm:block"
            />
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <Link href="/search">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-[var(--cyber-cyan)] transition-colors" />
              <div className="w-full h-10 pl-10 pr-4 bg-[#13131a] border border-[#2a2a35] rounded-none clip-cyber flex items-center text-muted-foreground text-sm font-mono group-hover:border-[var(--cyber-cyan)] transition-colors cursor-pointer">
                {t('search')}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <NotificationBell />
          {session && (
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[var(--cyber-cyan)] relative">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link href="/search" className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[var(--cyber-cyan)]">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-none clip-cyber p-0 overflow-hidden border border-[#2a2a35] hover:border-[var(--cyber-cyan)]">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)]">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#13131a] border-[#2a2a35]" align="end">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8 rounded-none clip-cyber">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)] text-xs">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{session.user?.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#2a2a35]" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1a1a24] focus:bg-[#1a1a24]">
                  <Link href={`/profile/${session.user?.id}`} className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-[var(--cyber-cyan)]" />
                    <span>{t('profile')}</span>
                  </Link>
                </DropdownMenuItem>
                {session.user?.role === "ADMIN" && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#1a1a24] focus:bg-[#1a1a24]">
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-[var(--cyber-magenta)]" />
                      <span>{t('adminPanel')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#2a2a35]" />
                <DropdownMenuItem
                  className="cursor-pointer text-[var(--cyber-magenta)] hover:bg-[#1a1a24] focus:bg-[#1a1a24]"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('disconnect')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-mono text-sm hover:text-[var(--cyber-cyan)]">
                  {t('jackIn')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-cyber text-xs">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
