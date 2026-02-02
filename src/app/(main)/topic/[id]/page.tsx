import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { CommentItem, CommentForm, ReactionButton } from "@/components/forum";
import { GlitchText, HologramBadge } from "@/components/cyberpunk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Eye, MessageSquare, Pin, Lock } from "lucide-react";

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

async function getTopic(id: string) {
  const topic = await prisma.topic.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true, bio: true },
      },
      category: true,
      reactions: {
        select: { type: true, userId: true },
      },
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          reactions: {
            select: { type: true, userId: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, image: true, role: true },
              },
              reactions: {
                select: { type: true, userId: true },
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, image: true, role: true },
                  },
                  reactions: {
                    select: { type: true, userId: true },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return topic;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const [topic, session] = await Promise.all([
    getTopic(id).catch(() => null),
    auth(),
  ]);

  if (!topic) {
    notFound();
  }

  const roleVariant = topic.author.role === "ADMIN" 
    ? "admin" 
    : topic.author.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  return (
    <div className="space-y-6">
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
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none font-mono text-sm whitespace-pre-wrap mb-6">
          {topic.content}
        </div>

        {/* Stats and reactions */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#2a2a35]">
          <ReactionButton
            targetId={topic.id}
            targetType="topic"
            reactions={topic.reactions}
            currentUserId={session?.user?.id}
          />
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{topic._count.comments} comments</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{topic.viewCount} views</span>
          </div>
        </div>
      </article>

      {/* Comments section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--cyber-magenta)] font-mono uppercase tracking-wider">
          // Comments ({topic._count.comments})
        </h2>

        {/* Comment form */}
        {session?.user && !topic.isLocked ? (
          <div className="card-cyber p-4">
            <CommentForm topicId={topic.id} />
          </div>
        ) : topic.isLocked ? (
          <div className="card-cyber p-4 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              This topic is locked. No new comments can be added.
            </p>
          </div>
        ) : (
          <div className="card-cyber p-4 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              <Link href="/login" className="text-[var(--cyber-cyan)] hover:underline">
                Jack in
              </Link>
              {" "}to join the conversation.
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {topic.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              topicId={topic.id}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>

        {topic.comments.length === 0 && (
          <div className="card-cyber p-8 text-center">
            <p className="text-muted-foreground font-mono">
              No comments yet. Be the first to respond.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
