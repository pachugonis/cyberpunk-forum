"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  content: string;
  createdAt: string | Date;
  isOwn: boolean;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function MessageItem({ content, createdAt, isOwn, sender }: MessageItemProps) {
  return (
    <div className={cn("flex gap-3 mb-4", isOwn && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 border-2 border-primary/30">
        <AvatarImage src={sender.image || ""} />
        <AvatarFallback className="bg-primary/20 text-primary text-xs">
          {sender.name?.[0]?.toUpperCase() || sender.email[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2 break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          <p className="text-sm">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
