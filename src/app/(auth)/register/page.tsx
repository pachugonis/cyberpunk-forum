"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('error'));
      } else {
        // Show recovery code dialog
        setRecoveryCode(data.recoveryCode);
        setShowRecoveryDialog(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (recoveryCode) {
      try {
        await navigator.clipboard.writeText(recoveryCode);
        setCopied(true);
        toast.success(t('codeCopied'));
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy code');
      }
    }
  };

  const handleCloseDialog = () => {
    setShowRecoveryDialog(false);
    router.push("/login?registered=true");
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-[var(--cyber-magenta)] border border-[var(--cyber-magenta)] bg-[var(--cyber-magenta)]/10 clip-cyber">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
            {t('name')}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
            placeholder={t('namePlaceholder')}
          />
        </div>

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
          <Label htmlFor="password" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
            {t('password')}
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
            <span className="animate-pulse">{t('submitting')}</span>
          ) : (
            t('submit')
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground font-mono text-sm">
          {t('existingUser')}{" "}
          <Link
            href="/login"
            className="text-[var(--cyber-cyan)] hover:text-neon-cyan transition-all"
          >
            {t('jackIn')}
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#2a2a35]">
        <p className="text-center text-xs text-muted-foreground font-mono opacity-50">
          {t('secureConnection')}
        </p>
      </div>

      {/* Recovery Code Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md bg-[#0d0d12] border-[var(--cyber-magenta)] clip-cyber">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[var(--cyber-magenta)] font-mono uppercase">
              {t('recoveryCodeTitle')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono text-sm">
              {t('recoveryCodeWarning')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="p-4 border border-[var(--cyber-cyan)] bg-[var(--cyber-cyan)]/5 clip-cyber">
              <Label className="text-xs text-[var(--cyber-cyan)] font-mono uppercase mb-2 block">
                {t('recoveryCodeLabel')}
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-2xl font-bold text-white font-mono tracking-wider break-all">
                  {recoveryCode}
                </code>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="icon"
                  className="border-[var(--cyber-cyan)] text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-3 border border-[var(--cyber-magenta)]/50 bg-[var(--cyber-magenta)]/5 clip-cyber">
              <p className="text-xs text-[var(--cyber-magenta)] font-mono">
                ⚠️ {t('recoveryCodeImportant')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCloseDialog}
              className="w-full bg-[var(--cyber-magenta)] text-white hover:shadow-neon-magenta clip-cyber font-mono uppercase"
            >
              {t('understood')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
