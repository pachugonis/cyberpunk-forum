"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HologramBadge } from "@/components/cyberpunk";
import { ReactionButton } from "./reaction-button";
import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CommentForm } from "./comment-form";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
    };
    reactions: Array<{
      type: string;
      userId: string;
    }>;
    replies?: CommentItemProps["comment"][];
  };
  topicId: string;
  currentUserId?: string;
  depth?: number;
}

export function CommentItem({ comment, topicId, currentUserId, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const roleVariant = comment.author.role === "ADMIN" 
    ? "admin" 
    : comment.author.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  const maxDepth = 3;
  const canReply = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? "ml-8 border-l border-[#2a2a35] pl-4" : ""}`}>
      <div className="bg-[#13131a] border border-[#2a2a35] p-4 clip-cyber">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 rounded-none clip-cyber shrink-0">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)] text-xs">
              {comment.author.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <HologramBadge variant={roleVariant} className="text-[10px]">
                {comment.author.role}
              </HologramBadge>
              <span className="text-xs text-muted-foreground font-mono">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="text-sm text-foreground whitespace-pre-wrap mb-3 font-mono">
              {comment.content}
            </div>
            
            <div className="flex items-center gap-3">
              <ReactionButton
                targetId={comment.id}
                targetType="comment"
                reactions={comment.reactions}
                currentUserId={currentUserId}
              />
              
              {canReply && currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-mono text-muted-foreground hover:text-[var(--cyber-cyan)]"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-8">
          <CommentForm 
            topicId={topicId} 
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              topicId={topicId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
