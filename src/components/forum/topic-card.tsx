import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CyberCard } from "@/components/cyberpunk";
import { HologramBadge } from "@/components/cyberpunk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, Pin, Lock } from "lucide-react";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
    };
    _count?: {
      comments: number;
      reactions: number;
    };
  };
}

export function TopicCard({ topic }: TopicCardProps) {
  const roleVariant = topic.author.role === "ADMIN" 
    ? "admin" 
    : topic.author.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  return (
    <Link href={`/topic/${topic.id}`}>
      <CyberCard 
        className="group"
        variant={topic.isPinned ? "highlighted" : "default"}
      >
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 rounded-none clip-cyber shrink-0">
            <AvatarImage src={topic.author.image || ""} />
            <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)]">
              {topic.author.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {topic.isPinned && (
                <Pin className="h-4 w-4 text-[var(--cyber-yellow)]" />
              )}
              {topic.isLocked && (
                <Lock className="h-4 w-4 text-[var(--cyber-magenta)]" />
              )}
              <h3 className="font-bold text-base group-hover:text-[var(--cyber-cyan)] transition-colors truncate">
                {topic.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-mono">
              {topic.content.substring(0, 150)}...
            </p>
            
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-foreground">{topic.author.name}</span>
                <HologramBadge variant={roleVariant} className="ml-1">
                  {topic.author.role}
                </HologramBadge>
              </div>
              <span className="opacity-50">|</span>
              <span>{formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}</span>
              <span className="opacity-50">|</span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{topic._count?.comments || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{topic.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CyberCard>
    </Link>
  );
}
