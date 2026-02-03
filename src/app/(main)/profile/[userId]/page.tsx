import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import { TopicCard } from "@/components/forum";
import { GlitchText, HologramBadge, CyberCard } from "@/components/cyberpunk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MessageSquare, FileText, Mail } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      bio: true,
      createdAt: true,
      topics: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          _count: {
            select: { comments: true, reactions: true },
          },
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          topic: {
            select: { id: true, title: true },
          },
        },
      },
      _count: {
        select: { topics: true, comments: true },
      },
    },
  });

  return user;
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const user = await getUser(userId);
  const session = await auth();

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === userId;

  const roleVariant = user.role === "ADMIN" 
    ? "admin" 
    : user.role === "MODERATOR" 
    ? "moderator" 
    : "user";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to forum
      </Link>

      {/* Profile header */}
      <CyberCard variant="highlighted" className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24 rounded-none clip-cyber-lg shrink-0">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="rounded-none bg-[#1a1a24] text-[var(--cyber-cyan)] text-2xl">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <GlitchText 
                text={user.name || "Anonymous"} 
                as="h1"
                className="text-2xl font-bold text-[var(--cyber-cyan)]"
              />
              <HologramBadge variant={roleVariant}>
                {user.role}
              </HologramBadge>
            </div>
            
            {user.bio && (
              <p className="text-muted-foreground font-mono text-sm mb-4">
                {user.bio}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{user._count.topics} topics</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{user._count.comments} comments</span>
              </div>
            </div>
            
            {!isOwnProfile && session?.user && (
              <div className="mt-4">
                <Link href={`/messages?userId=${user.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CyberCard>

      {/* Activity tabs */}
      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList className="bg-[#13131a] border border-[#2a2a35] p-1">
          <TabsTrigger 
            value="topics" 
            className="font-mono text-sm data-[state=active]:bg-[var(--cyber-cyan)] data-[state=active]:text-[#0a0a0f]"
          >
            Topics ({user._count.topics})
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="font-mono text-sm data-[state=active]:bg-[var(--cyber-cyan)] data-[state=active]:text-[#0a0a0f]"
          >
            Comments ({user._count.comments})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-3">
          {user.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
          {user.topics.length === 0 && (
            <CyberCard className="p-8 text-center">
              <p className="text-muted-foreground font-mono">
                No topics yet.
              </p>
            </CyberCard>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-3">
          {user.comments.map((comment) => (
            <Link key={comment.id} href={`/topic/${comment.topic.id}`}>
              <CyberCard className="p-4">
                <p className="text-xs text-muted-foreground font-mono mb-2">
                  In response to: <span className="text-[var(--cyber-cyan)]">{comment.topic.title}</span>
                </p>
                <p className="text-sm font-mono line-clamp-2">
                  {comment.content}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </CyberCard>
            </Link>
          ))}
          {user.comments.length === 0 && (
            <CyberCard className="p-8 text-center">
              <p className="text-muted-foreground font-mono">
                No comments yet.
              </p>
            </CyberCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
