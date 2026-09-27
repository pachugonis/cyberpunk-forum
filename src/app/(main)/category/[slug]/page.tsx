import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopicCard } from "@/components/forum/topic-card";
import { GlitchText } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { clampInt } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

async function getCategory(slug: string, page: number) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { 
          topics: {
            where: {
              deletedAt: null, // Exclude deleted topics from count
            },
          },
        },
      },
    },
  });

  if (!category) return null;

  const topics = await prisma.topic.findMany({
    where: {
      categoryId: category.id,
      deletedAt: null, // Exclude deleted topics
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
      _count: {
        select: { comments: true, reactions: true },
      },
    },
  });

  return { ...category, topics };
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = clampInt(pageParam ?? null, 1, 1, 10000);
  const [category, tCategory, tHome] = await Promise.all([
    getCategory(slug, page),
    getTranslations('category'),
    getTranslations('home'),
  ]);

  if (!category) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(category._count.topics / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tCategory('backToCategories')}
      </Link>

      {/* Header */}
      <div className="card-cyber p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <GlitchText 
              text={category.name.toUpperCase()} 
              as="h1"
              className="text-2xl font-bold mb-2"
              style={{ color: category.color || "var(--cyber-cyan)" } as React.CSSProperties}
            />
            <p className="text-muted-foreground font-mono text-sm mb-2">
              {category.description || tCategory('noDescription')}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {category._count.topics} {tCategory('topics')}
            </p>
          </div>
          <Link href={`/topic/new?category=${category.id}`}>
            <Button className="btn-cyber shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              {tHome('newTopic')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {category.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between font-mono text-sm">
          {page > 1 ? (
            <Link href={`/category/${slug}?page=${page - 1}`} className="text-[var(--cyber-cyan)] hover:underline">
              ← {tCategory('previousPage')}
            </Link>
          ) : <span />}
          <span className="text-muted-foreground">
            {tCategory('pageOf', { page, total: totalPages })}
          </span>
          {page < totalPages ? (
            <Link href={`/category/${slug}?page=${page + 1}`} className="text-[var(--cyber-cyan)] hover:underline">
              {tCategory('nextPage')} →
            </Link>
          ) : <span />}
        </nav>
      )}

      {category.topics.length === 0 && page === 1 && (
        <div className="card-cyber p-8 text-center">
          <p className="text-muted-foreground font-mono mb-4">
            {tCategory('noTopicsInCategory')}
          </p>
          <Link href={`/topic/new?category=${category.id}`}>
            <Button className="btn-cyber">
              <Plus className="h-4 w-4 mr-2" />
              {tHome('createFirstTopic')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
