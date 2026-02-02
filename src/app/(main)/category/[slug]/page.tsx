import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopicCard } from "@/components/forum";
import { GlitchText } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      topics: {
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
      },
      _count: {
        select: { topics: true },
      },
    },
  });

  return category;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to categories
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
              {category.description || "No description"}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {category._count.topics} topics
            </p>
          </div>
          <Link href={`/topic/new?category=${category.id}`}>
            <Button className="btn-cyber shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              NEW TOPIC
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

      {category.topics.length === 0 && (
        <div className="card-cyber p-8 text-center">
          <p className="text-muted-foreground font-mono mb-4">
            No topics in this category yet.
          </p>
          <Link href={`/topic/new?category=${category.id}`}>
            <Button className="btn-cyber">
              <Plus className="h-4 w-4 mr-2" />
              CREATE FIRST TOPIC
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
