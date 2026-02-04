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
  const t2fa = useTranslations('auth.twoFactor');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // First check if 2FA is required
      const checkResponse = await fetch("/api/auth/2fa/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const { requiresTwoFactor } = await checkResponse.json();
        
        if (requiresTwoFactor) {
          // Store credentials and show 2FA form
          setRequiresTwoFactor(true);
          setCredentials({ email, password });
          setLoading(false);
          return;
        }
      }

      // If 2FA is not required, proceed with normal login
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

  const handleTwoFactorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;

    try {
      // Verify 2FA token
      const response = await fetch("/api/auth/2fa/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t2fa('invalidCode'));
        setLoading(false);
        return;
      }

      // Now sign in with NextAuth
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t2fa('error'));
    } finally {
      setLoading(false);
    }
  };

  if (requiresTwoFactor) {
    return (
      <div className="card-cyber p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neon-cyan mb-2">
            {t2fa('loginTitle')}
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            {t2fa('loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-[var(--cyber-magenta)] border border-[var(--cyber-magenta)] bg-[var(--cyber-magenta)]/10 clip-cyber">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="token" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
              {t2fa('verificationCode')}
            </Label>
            <Input
              id="token"
              name="token"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] focus:ring-[var(--cyber-cyan)]/20 font-mono text-center text-2xl tracking-widest"
              placeholder={t2fa('codePlaceholder')}
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-cyber h-12 text-base"
          >
            {loading ? (
              <span className="animate-pulse">{t2fa('verifying')}</span>
            ) : (
              t2fa('verify')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setRequiresTwoFactor(false)}
            className="text-muted-foreground font-mono text-sm hover:text-[var(--cyber-cyan)] transition-all"
          >
            {t2fa('cancel')}
          </button>
        </div>
      </div>
    );
  }

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
