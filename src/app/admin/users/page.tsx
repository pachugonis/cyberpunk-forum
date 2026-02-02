"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { GlitchText, CyberCard, HologramBadge } from "@/components/cyberpunk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { topics: number; comments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const roleVariant = (role: string) => {
    if (role === "ADMIN") return "admin";
    if (role === "MODERATOR") return "moderator";
    return "user";
  };

  return (
    <div className="space-y-6">
      <div>
        <GlitchText
          text="USER MANAGEMENT"
          as="h1"
          className="text-2xl font-bold text-[var(--cyber-magenta)] mb-2"
        />
        <p className="text-muted-foreground font-mono text-sm">
          Manage user accounts and roles.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground font-mono">Loading...</p>
      ) : users.length === 0 ? (
        <CyberCard className="p-8 text-center">
          <p className="text-muted-foreground font-mono">No users found.</p>
        </CyberCard>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <CyberCard key={user.id} className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-none clip-cyber">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)]">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{user.name || "Anonymous"}</span>
                      <HologramBadge variant={roleVariant(user.role)}>
                        {user.role}
                      </HologramBadge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })} | {user._count.topics} topics | {user._count.comments} comments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="h-9 px-3 bg-[#1a1a24] border border-[#2a2a35] text-foreground font-mono text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      )}
    </div>
  );
}
