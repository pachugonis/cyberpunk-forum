"use client";

import { useLocale } from 'next-intl';
import { useTransition, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (newLocale: string) => {
    startTransition(() => {
      // Set cookie for locale
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      // Reload page to apply new locale
      window.location.reload();
    });
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        className="text-2xl hover:text-[var(--cyber-cyan)] h-10 w-10 p-0"
        disabled
      >
        <span>🌐</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-2xl hover:text-[var(--cyber-cyan)] h-10 w-10 p-0"
          disabled={isPending}
        >
          <span>{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-48 bg-[#13131a] border-[#2a2a35]" 
        align="end"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer hover:bg-[#1a1a24] focus:bg-[#1a1a24] ${
              locale === lang.code ? 'text-[var(--cyber-cyan)]' : ''
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto text-[var(--cyber-cyan)]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
