import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CommentItem } from "@/components/forum/comment-item";
import { CommentForm } from "@/components/forum/comment-form";
import { ReactionButton } from "@/components/forum/reaction-button";
import { AttachmentList } from "@/components/forum/attachment-list";
import { TopicHeader } from "@/components/forum/topic-header";
import { MarkdownContent } from "@/components/forum/markdown-content";
import { Eye, MessageSquare } from "lucide-react";
import { getTranslations } from 'next-intl/server';

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

const attachmentSelect = {
  id: true,
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  url: true,
} as const;

async function getTopic(id: string) {
  const [topic, comments] = await Promise.all([
    prisma.topic.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true, bio: true },
        },
        category: true,
        attachments: { select: attachmentSelect },
        reactions: {
          select: { type: true, userId: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    // Load every comment in one flat query and build the reply tree in memory,
    // so replies of any depth are shown
    prisma.comment.findMany({
      where: { topicId: id },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        attachments: { select: attachmentSelect },
        reactions: {
          select: { type: true, userId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!topic) return null;

  type CommentNode = (typeof comments)[number] & {
    renderedContent: React.ReactNode;
    replies: CommentNode[];
  };
  const nodes = new Map<string, CommentNode>(
    comments.map((c) => [
      c.id,
      {
        ...c,
        renderedContent: c.deletedAt ? null : <MarkdownContent content={c.content} />,
        replies: [],
      },
    ])
  );
  const rootComments: CommentNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else rootComments.push(node);
  }

  return { ...topic, comments: rootComments };
}

export const revalidate = 30; // Revalidate every 30 seconds for more fresh comments

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const [topic, session, tTopic] = await Promise.all([
    getTopic(id).catch(() => null),
    auth(),
    getTranslations('topic'),
  ]);

  if (!topic || topic.deletedAt) {
    notFound();
  }

  // Count the view after the response is sent, outside of rendering
  after(() =>
    prisma.topic
      .updateMany({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch((error) => console.error("Error incrementing view count:", error))
  );

  return (
    <div className="space-y-6">
      <TopicHeader
        topic={topic}
        renderedContent={<MarkdownContent content={topic.content} />}
        currentUserId={session?.user?.id}
        userRole={session?.user?.role}
      />

      {/* Attachments */}
      {topic.attachments && topic.attachments.length > 0 && (
        <div className="card-cyber p-6">
          <AttachmentList attachments={topic.attachments} />
        </div>
      )}

      {/* Stats and reactions */}
      <div className="bg-[#13131a] border border-[#2a2a35] p-6">
        <div className="flex items-center gap-4">
          <ReactionButton
            targetId={topic.id}
            targetType="topic"
            reactions={topic.reactions}
            currentUserId={session?.user?.id}
          />
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{topic._count.comments} {tTopic('statsComments')}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{topic.viewCount} {tTopic('statsViews')}</span>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--cyber-magenta)] font-mono uppercase tracking-wider">
          {tTopic('commentsSectionTitle')} ({topic._count.comments})
        </h2>

        {/* Comment form */}
        {session?.user && !topic.isLocked ? (
          <div className="card-cyber p-4">
            <CommentForm topicId={topic.id} />
          </div>
        ) : topic.isLocked ? (
          <div className="card-cyber p-4 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              {tTopic('topicLockedMessage')}
            </p>
          </div>
        ) : (
          <div className="card-cyber p-4 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              <Link href="/login" className="text-[var(--cyber-cyan)] hover:underline">
                {tTopic('loginToComment_pre')}
              </Link>
              {" "}
              {tTopic('loginToComment_post')}
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
              {tTopic('noCommentsYet')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
