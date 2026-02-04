"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HologramBadge } from "@/components/cyberpunk";
import { ReactionButton } from "./reaction-button";
import { ReportButton } from "./report-button";
import { AttachmentList } from "./attachment-list";
import { Reply, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CommentForm } from "./comment-form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    editedAt?: Date | null;
    deletedAt?: Date | null;
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
    attachments?: Array<{
      id: string;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
    }>;
    replies?: CommentItemProps["comment"][];
  };
  topicId: string;
  currentUserId?: string;
  depth?: number;
}

export function CommentItem({ comment, topicId, currentUserId, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations("comment");
  
  const roleVariant = comment.author.role === "ADMIN" 
    ? "admin" 
    : comment.author.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  const maxDepth = 3;
  const canReply = depth < maxDepth;
  const isAuthor = currentUserId === comment.author.id;
  const isDeleted = !!comment.deletedAt;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update comment");
      }

      toast.success("Comment updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      toast.success("Comment deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

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
              {comment.editedAt && !isDeleted && (
                <span className="text-xs text-[var(--cyber-cyan)] font-mono">
                  ({t("editedAt")} {formatDistanceToNow(new Date(comment.editedAt), { addSuffix: true })})
                </span>
              )}
              {isDeleted && (
                <span className="text-xs text-red-500 font-mono">
                  ({t("deletedAt")} {formatDistanceToNow(new Date(comment.deletedAt!), { addSuffix: true })})
                </span>
              )}
            </div>
            
            
            {isEditing ? (
              <div className="mb-3 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] bg-[#0d0d12] border-[#2a2a35] font-mono text-sm"
                  placeholder={t("writeComment")}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    size="sm"
                    className="h-8 bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80 font-mono"
                  >
                    {isSaving ? t("saving") : t("save")}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    variant="ghost"
                    size="sm"
                    className="h-8 font-mono"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-foreground whitespace-pre-wrap mb-3 font-mono">
                {isDeleted ? (
                  <span className="text-muted-foreground italic">{t("deleted")}</span>
                ) : (
                  comment.content
                )}
              </div>
            )}
            
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3">
                <AttachmentList attachments={comment.attachments} />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <ReactionButton
                targetId={comment.id}
                targetType="comment"
                reactions={comment.reactions}
                currentUserId={currentUserId}
              />
              
              {canReply && currentUserId && !isDeleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-mono text-muted-foreground hover:text-[var(--cyber-cyan)]"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  {t("reply")}
                </Button>
              )}
              
              {currentUserId && currentUserId !== comment.author.id && !isDeleted && (
                <ReportButton commentId={comment.id} size="sm" />
              )}
              
              {isAuthor && !isDeleted && !isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-mono text-muted-foreground hover:text-[var(--cyber-cyan)]"
                    onClick={handleEdit}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-mono text-muted-foreground hover:text-red-500"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t("delete")}
                  </Button>
                </>
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
