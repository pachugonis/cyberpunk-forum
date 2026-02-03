import { prisma } from "@/lib/prisma";
import { CategoryCard, TopicCard } from "@/components/forum";
import { GlitchText } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import { Plus } from "lucide-react";

async function getHomeData(sort?: string) {
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
      orderBy: sort === "latest"
        ? [{ createdAt: "desc" }]
        : [
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

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const { categories, recentTopics } = await getHomeData(searchParams.sort);
  const t = await getTranslations('home');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <GlitchText 
            text={t('welcome')}
            as="h1"
            className="text-2xl md:text-3xl font-bold text-[var(--cyber-cyan)] mb-2"
          />
          <p className="text-muted-foreground font-mono text-sm">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/topic/new">
          <Button className="btn-cyber hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            {t('newTopic')}
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-bold mb-4 text-[var(--cyber-magenta)] font-mono uppercase tracking-wider">
          {t('categoriesTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {categories.length === 0 && (
          <div className="card-cyber p-8 text-center">
            <p className="text-muted-foreground font-mono">
              {t('noCategories')}
            </p>
          </div>
        )}
      </section>

      {/* Recent Topics */}
      <section id="topics">
        <h2 className="text-lg font-bold mb-4 text-[var(--cyber-yellow)] font-mono uppercase tracking-wider">
          {t('recentActivity')}
        </h2>
        <div className="space-y-3">
          {recentTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
        {recentTopics.length === 0 && (
          <div className="card-cyber p-8 text-center">
            <p className="text-muted-foreground font-mono mb-4">
              {t('noTopics')}
            </p>
            <Link href="/topic/new">
              <Button className="btn-cyber">
                <Plus className="h-4 w-4 mr-2" />
                {t('createFirstTopic')}
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
