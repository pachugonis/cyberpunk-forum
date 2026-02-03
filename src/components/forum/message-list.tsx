"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  createdAt: string | Date;
  isRead: boolean;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  content: string;
  createdAt: string | Date;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  unreadCount: number;
}

interface MessageListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (userId: string) => void;
  currentUserId: string;
}

export function MessageList({
  conversations,
  selectedUserId,
  onSelectConversation,
  currentUserId,
}: MessageListProps) {
  const t = useTranslations("messages");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("noConversations")}</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.otherUser.id}
              onClick={() => onSelectConversation(conversation.otherUser.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg transition-all duration-200 hover:bg-accent/50",
                "border border-transparent hover:border-primary/30",
                selectedUserId === conversation.otherUser.id &&
                  "bg-accent border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarImage src={conversation.otherUser.image || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {conversation.otherUser.name?.[0]?.toUpperCase() ||
                      conversation.otherUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {conversation.otherUser.name || conversation.otherUser.email}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate pr-2">
                      {conversation.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="bg-primary/80 text-primary-foreground"
                      >
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
