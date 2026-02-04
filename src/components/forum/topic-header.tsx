"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { TopicActions, EditTopicDialog } from "@/components/forum";
import { GlitchText, HologramBadge } from "@/components/cyberpunk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Pin, Lock } from "lucide-react";

interface TopicHeaderProps {
  topic: {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    isLocked: boolean;
    createdAt: Date;
    editedAt: Date | null;
    deletedAt: Date | null;
    categoryId: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
      bio?: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
  };
  currentUserId?: string;
  userRole?: string;
}

export function TopicHeader({ topic, currentUserId, userRole }: TopicHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const isAuthor = currentUserId === topic.author.id;
  const isAdmin = userRole === "ADMIN";
  const isModerator = userRole === "MODERATOR";

  const roleVariant = topic.author.role === "ADMIN" 
    ? "admin" 
    : topic.author.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  return (
    <>
      {/* Back button */}
      <Link 
        href={`/category/${topic.category.slug}`} 
        className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {topic.category.name}
      </Link>

      {/* Topic */}
      <article className="card-cyber p-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {topic.isPinned && (
              <div className="flex items-center gap-1 text-[var(--cyber-yellow)] text-xs font-mono">
                <Pin className="h-4 w-4" />
                PINNED
              </div>
            )}
            {topic.isLocked && (
              <div className="flex items-center gap-1 text-[var(--cyber-magenta)] text-xs font-mono">
                <Lock className="h-4 w-4" />
                LOCKED
              </div>
            )}
            <Link 
              href={`/category/${topic.category.slug}`}
              className="text-xs font-mono px-2 py-1 bg-[#1a1a24] hover:bg-[#2a2a35] transition-colors"
              style={{ color: topic.category.color || "var(--cyber-cyan)" }}
            >
              {topic.category.name}
            </Link>
          </div>
          
          <TopicActions
            topicId={topic.id}
            isAuthor={isAuthor}
            isAdmin={isAdmin}
            isModerator={isModerator}
            onEdit={() => setEditDialogOpen(true)}
          />
        </div>

        {/* Title */}
        <GlitchText 
          text={topic.title} 
          as="h1"
          className="text-xl md:text-2xl font-bold text-[var(--cyber-cyan)] mb-4"
        />

        {/* Author info */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#2a2a35]">
          <Avatar className="h-10 w-10 rounded-none clip-cyber">
            <AvatarImage src={topic.author.image || ""} />
            <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)]">
              {topic.author.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${topic.author.id}`}
                className="font-medium hover:text-[var(--cyber-cyan)] transition-colors"
              >
                {topic.author.name}
              </Link>
              <HologramBadge variant={roleVariant}>
                {topic.author.role}
              </HologramBadge>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
              {topic.editedAt && (
                <span className="ml-2 text-[var(--cyber-yellow)]">
                  • edited {formatDistanceToNow(new Date(topic.editedAt), { addSuffix: true })}
                </span>
              )}
              {topic.deletedAt && (
                <span className="ml-2 text-red-400">
                  • deleted {formatDistanceToNow(new Date(topic.deletedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none font-mono text-sm whitespace-pre-wrap">
          {topic.content}
        </div>
      </article>

      <EditTopicDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        topic={{
          id: topic.id,
          title: topic.title,
          content: topic.content,
          categoryId: topic.categoryId,
        }}
      />
    </>
  );
}
