"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError("Passwords do not match");
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
        setError(data.error || "Registration failed");
      } else {
        router.push("/login?registered=true");
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
          NEW IDENTITY
        </h1>
        <p className="text-muted-foreground font-mono text-sm">
          JOIN THE NETWORK
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
            Handle
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
            placeholder="V"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
            placeholder="netrunner@nightcity.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
            placeholder="************"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[var(--cyber-magenta)] font-mono uppercase text-xs tracking-wider">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-magenta)] focus:ring-[var(--cyber-magenta)]/20 font-mono"
            placeholder="************"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base bg-[var(--cyber-magenta)] text-white hover:shadow-neon-magenta border-0 clip-cyber font-mono uppercase tracking-wider"
        >
          {loading ? (
            <span className="animate-pulse">PROCESSING...</span>
          ) : (
            "CREATE IDENTITY"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground font-mono text-sm">
          Already have access?{" "}
          <Link
            href="/login"
            className="text-[var(--cyber-cyan)] hover:text-neon-cyan transition-all"
          >
            JACK IN
          </Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#2a2a35]">
        <p className="text-center text-xs text-muted-foreground font-mono opacity-50">
          IDENTITY PROTOCOL v2.077
        </p>
      </div>
    </div>
  );
}
