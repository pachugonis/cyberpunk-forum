"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-cyber p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neon-cyan mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground font-mono text-sm">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-[var(--cyber-magenta)] border border-[var(--cyber-magenta)] bg-[var(--cyber-magenta)]/10 clip-cyber">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
            {t('email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] focus:ring-[var(--cyber-cyan)]/20 font-mono"
            placeholder={t('emailPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
            {t('password')}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] focus:ring-[var(--cyber-cyan)]/20 font-mono"
            placeholder={t('passwordPlaceholder')}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full btn-cyber h-12 text-base"
        >
          {loading ? (
            <span className="animate-pulse">{t('submitting')}</span>
          ) : (
            t('submit')
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-muted-foreground font-mono text-sm">
          {t('newUser')}{" "}
          <Link
            href="/register"
            className="text-[var(--cyber-magenta)] hover:text-neon-magenta transition-all"
          >
            {t('createIdentity')}
          </Link>
        </p>
        <p className="text-muted-foreground font-mono text-xs">
          {t('forgotPassword')}{" "}
          <Link
            href="/recover"
            className="text-[var(--cyber-cyan)] hover:text-neon-cyan transition-all"
          >
            {t('recoverAccount')}
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#2a2a35]">
        <p className="text-center text-xs text-muted-foreground font-mono opacity-50">
          {t('secureConnection')}
        </p>
      </div>
    </div>
  );
}
