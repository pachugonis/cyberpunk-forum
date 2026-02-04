"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical } from "lucide-react";

interface TopicActionsProps {
  topicId: string;
  isAuthor: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  onEdit: () => void;
}

export function TopicActions({
  topicId,
  isAuthor,
  isAdmin,
  isModerator,
  onEdit,
}: TopicActionsProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canModify = isAuthor || isAdmin || isModerator;

  if (!canModify) return null;

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete topic");
      }

      toast.success("Topic deleted");
      setDeleteDialogOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-[var(--cyber-cyan)] hover:bg-[#1a1a24]"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#0d0d12] border-[#2a2a35] text-foreground"
        >
          <DropdownMenuItem
            onClick={onEdit}
            className="cursor-pointer hover:bg-[#1a1a24] focus:bg-[#1a1a24] focus:text-[var(--cyber-cyan)]"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Topic
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer hover:bg-[#1a1a24] focus:bg-[#1a1a24] text-red-400 focus:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Topic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0d0d12] border border-[#2a2a35]">
          <DialogHeader>
            <DialogTitle className="text-[var(--cyber-cyan)] font-mono">
              DELETE TOPIC
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono">
              Are you sure you want to delete this topic? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white font-mono"
            >
              {deleting ? "DELETING..." : "DELETE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
