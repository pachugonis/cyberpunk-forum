"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RecoverPage() {
  const router = useRouter();
  const t = useTranslations('auth.recover');
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCodeState] = useState("");

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const code = formData.get("recoveryCode") as string;

    try {
      const response = await fetch("/api/auth/verify-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, recoveryCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('error'));
      } else {
        setEmail(emailValue);
        setRecoveryCodeState(code);
        setStep('password');
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          recoveryCode, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('error'));
      } else {
        toast.success(t('success'));
        router.push("/login?recovered=true");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-cyber p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neon-magenta mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground font-mono text-sm">
          {t('subtitle')}
        </p>
      </div>

      {step === 'code' ? (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-[var(--cyber-magenta)] border border-[var(--cyber-magenta)] bg-[var(--cyber-magenta)]/10 clip-cyber">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
              {t('email')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryCode" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
              {t('recoveryCode')}
            </Label>
            <Input
              id="recoveryCode"
              name="recoveryCode"
              type="text"
              required
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono text-lg tracking-widest"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              maxLength={19}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base bg-[var(--cyber-magenta)] text-white hover:shadow-neon-magenta border-0 clip-cyber font-mono uppercase tracking-wider"
          >
            {loading ? (
              <span className="animate-pulse">{t('verifying')}</span>
            ) : (
              t('verify')
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-[var(--cyber-magenta)] border border-[var(--cyber-magenta)] bg-[var(--cyber-magenta)]/10 clip-cyber">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
              {t('newPassword')}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
              {t('confirmPassword')}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base bg-[var(--cyber-magenta)] text-white hover:shadow-neon-magenta border-0 clip-cyber font-mono uppercase tracking-wider"
          >
            {loading ? (
              <span className="animate-pulse">{t('resetting')}</span>
            ) : (
              t('resetPassword')
            )}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-muted-foreground font-mono text-sm">
          {t('rememberPassword')}{" "}
          <Link
            href="/login"
            className="text-[var(--cyber-cyan)] hover:text-neon-cyan transition-all"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#2a2a35]">
        <p className="text-center text-xs text-muted-foreground font-mono opacity-50">
          {t('secureRecovery')}
        </p>
      </div>
    </div>
  );
}
