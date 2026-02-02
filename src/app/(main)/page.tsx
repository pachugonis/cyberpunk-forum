import { prisma } from "@/lib/prisma";
import { CategoryCard, TopicCard } from "@/components/forum";
import { GlitchText } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

async function getHomeData() {
  const [categories, recentTopics] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { topics: true },
        },
      },
    }),
    prisma.topic.findMany({
      take: 10,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    }),
  ]);

  return { categories, recentTopics };
}

export default async function HomePage() {
  const { categories, recentTopics } = await getHomeData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <GlitchText 
            text="WELCOME TO NIGHTCITY" 
            as="h1"
            className="text-2xl md:text-3xl font-bold text-[var(--cyber-cyan)] mb-2"
          />
          <p className="text-muted-foreground font-mono text-sm">
            The underground network for netrunners, fixers, and edgerunners.
          </p>
        </div>
        <Link href="/topic/new">
          <Button className="btn-cyber hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            NEW TOPIC
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-bold mb-4 text-[var(--cyber-magenta)] font-mono uppercase tracking-wider">
          // Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {categories.length === 0 && (
          <div className="card-cyber p-8 text-center">
            <p className="text-muted-foreground font-mono">
              No categories yet. Check back later.
            </p>
          </div>
        )}
      </section>

      {/* Recent Topics */}
      <section>
        <h2 className="text-lg font-bold mb-4 text-[var(--cyber-yellow)] font-mono uppercase tracking-wider">
          // Recent Activity
        </h2>
        <div className="space-y-3">
          {recentTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
        {recentTopics.length === 0 && (
          <div className="card-cyber p-8 text-center">
            <p className="text-muted-foreground font-mono mb-4">
              No topics yet. Be the first to start a conversation.
            </p>
            <Link href="/topic/new">
              <Button className="btn-cyber">
                <Plus className="h-4 w-4 mr-2" />
                CREATE FIRST TOPIC
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Mobile FAB */}
      <Link href="/topic/new" className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button className="h-14 w-14 rounded-full bg-[var(--cyber-cyan)] text-[#0a0a0f] shadow-neon-cyan hover:shadow-neon-cyan">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
