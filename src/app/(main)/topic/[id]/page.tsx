import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CommentItem, CommentForm, ReactionButton, AttachmentList, TopicHeader } from "@/components/forum";
import { Eye, MessageSquare } from "lucide-react";
import { getTranslations } from 'next-intl/server';

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
      attachments: {
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
        },
      },
      reactions: {
        select: { type: true, userId: true },
      },
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
            },
          },
          reactions: {
            select: { type: true, userId: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, image: true, role: true },
              },
              attachments: {
                select: {
                  id: true,
                  filename: true,
                  originalName: true,
                  mimeType: true,
                  size: true,
                  url: true,
                },
              },
              reactions: {
                select: { type: true, userId: true },
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, image: true, role: true },
                  },
                  attachments: {
                    select: {
                      id: true,
                      filename: true,
                      originalName: true,
                      mimeType: true,
                      size: true,
                      url: true,
                    },
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

export const revalidate = 30; // Revalidate every 30 seconds for more fresh comments

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const [topic, session, tTopic] = await Promise.all([
    getTopic(id).catch(() => null),
    auth(),
    getTranslations('topic'),
  ]);

  if (!topic) {
    notFound();
  }

  // If topic is deleted, return 404
  if (topic.deletedAt) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TopicHeader
        topic={topic}
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
