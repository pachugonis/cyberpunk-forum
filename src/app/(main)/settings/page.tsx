"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlitchText, CyberCard } from "@/components/cyberpunk";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("profile");
  const t2fa = useTranslations("auth.twoFactor");
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Check if 2FA is already enabled
    const checkTwoFactorStatus = async () => {
      try {
        const response = await fetch("/api/auth/2fa/status");
        if (response.ok) {
          const data = await response.json();
          setTwoFactorEnabled(data.enabled);
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      }
    };

    if (session?.user) {
      checkTwoFactorStatus();
    }
  }, [session]);

  const handleEnableTwoFactor = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast.error(t2fa("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Verification failed");
      }

      toast.success(t2fa("success"));
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setVerificationCode("");
      setQrCode("");
      setSecret("");
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      toast.error(error.message || t2fa("invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: disableCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Disable failed");
      }

      toast.success(t2fa("disableSuccess"));
      setTwoFactorEnabled(false);
      setDisableCode("");
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      toast.error(error.message || t2fa("invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <div className="text-center">
          <div className="animate-pulse text-[var(--cyber-cyan)]">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-[var(--cyber-cyan)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm">{t("backToForum")}</span>
        </Link>
        <GlitchText
          text={t("settings")}
          className="text-4xl font-bold mb-2"
        />
      </div>

      <CyberCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-[var(--cyber-cyan)]" />
          <h2 className="text-2xl font-bold text-[var(--cyber-cyan)]">
            {t("securitySettings")}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="border-t border-[#2a2a35] pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t2fa("title")}
                </h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {t2fa("subtitle")}
                </p>
                <div className="mt-2">
                  {twoFactorEnabled ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/30">
                      {t2fa("enabled")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      {t2fa("disabled")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!twoFactorEnabled && !showSetup && (
              <Button
                onClick={handleEnableTwoFactor}
                disabled={loading}
                className="btn-cyber"
              >
                {loading ? t2fa("verifying") : t2fa("enable")}
              </Button>
            )}

            {showSetup && (
              <div className="mt-6 space-y-6">
                <div className="border border-[#2a2a35] p-6 rounded-lg bg-[#13131a]">
                  <h4 className="text-lg font-semibold mb-4">
                    {t2fa("setup")}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t2fa("setupDescription")}
                  </p>

                  {qrCode && (
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white rounded-lg">
                        <Image
                          src={qrCode}
                          alt={t2fa("qrCodeAlt")}
                          width={256}
                          height={256}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t2fa("manualEntry")}
                    </p>
                    <code className="block p-3 bg-[#0a0a0f] border border-[#2a2a35] rounded font-mono text-sm break-all">
                      {secret}
                    </code>
                  </div>

                  <form onSubmit={handleVerifyAndEnable} className="space-y-4">
                    <div>
                      <Label htmlFor="verification-code">
                        {t2fa("verificationCode")}
                      </Label>
                      <Input
                        id="verification-code"
                        type="text"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        placeholder={t2fa("codePlaceholder")}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="font-mono text-center text-xl tracking-widest"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={loading || verificationCode.length !== 6}
                        className="btn-cyber"
                      >
                        {loading ? t2fa("verifying") : t2fa("verifyAndEnable")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowSetup(false);
                          setQrCode("");
                          setSecret("");
                          setVerificationCode("");
                        }}
                        variant="outline"
                        className="border-[#2a2a35]"
                      >
                        {t2fa("cancel")}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {twoFactorEnabled && (
              <div className="mt-6 border border-[#2a2a35] p-6 rounded-lg bg-[#13131a]">
                <h4 className="text-lg font-semibold mb-4">
                  {t2fa("disable")}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t2fa("enterCode")}
                </p>
                <form onSubmit={handleDisableTwoFactor} className="space-y-4">
                  <div>
                    <Label htmlFor="disable-code">
                      {t2fa("verificationCode")}
                    </Label>
                    <Input
                      id="disable-code"
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder={t2fa("codePlaceholder")}
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      required
                      className="font-mono text-center text-xl tracking-widest"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || disableCode.length !== 6}
                    variant="destructive"
                  >
                    {loading ? t2fa("verifying") : t2fa("disable")}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </CyberCard>
    </div>
  );
}
