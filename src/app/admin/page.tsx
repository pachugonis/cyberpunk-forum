import { prisma } from "@/lib/prisma";
import { GlitchText, CyberCard } from "@/components/cyberpunk";
import { Users, FileText, MessageSquare, FolderTree } from "lucide-react";

async function getStats() {
  const [userCount, topicCount, commentCount, categoryCount] = await Promise.all([
    prisma.user.count(),
    prisma.topic.count(),
    prisma.comment.count(),
    prisma.category.count(),
  ]);

  return { userCount, topicCount, commentCount, categoryCount };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Users", value: stats.userCount, icon: Users, color: "var(--cyber-cyan)" },
    { label: "Topics", value: stats.topicCount, icon: FileText, color: "var(--cyber-magenta)" },
    { label: "Comments", value: stats.commentCount, icon: MessageSquare, color: "var(--cyber-yellow)" },
    { label: "Categories", value: stats.categoryCount, icon: FolderTree, color: "var(--cyber-purple)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <GlitchText
          text="SYSTEM OVERVIEW"
          as="h1"
          className="text-2xl font-bold text-[var(--cyber-magenta)] mb-2"
        />
        <p className="text-muted-foreground font-mono text-sm">
          Network statistics and management tools.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <CyberCard key={stat.label} className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 flex items-center justify-center clip-cyber"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>

      {/* Quick actions */}
      <CyberCard className="p-6">
        <h2 className="text-lg font-bold text-[var(--cyber-cyan)] font-mono uppercase tracking-wider mb-4">
          // Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/categories"
            className="p-4 bg-[#1a1a24] hover:bg-[#2a2a35] transition-colors clip-cyber text-center"
          >
            <FolderTree className="h-8 w-8 mx-auto mb-2 text-[var(--cyber-magenta)]" />
            <p className="font-mono text-sm">Manage Categories</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 bg-[#1a1a24] hover:bg-[#2a2a35] transition-colors clip-cyber text-center"
          >
            <Users className="h-8 w-8 mx-auto mb-2 text-[var(--cyber-cyan)]" />
            <p className="font-mono text-sm">Manage Users</p>
          </a>
          <a
            href="/"
            className="p-4 bg-[#1a1a24] hover:bg-[#2a2a35] transition-colors clip-cyber text-center"
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--cyber-yellow)]" />
            <p className="font-mono text-sm">View Forum</p>
          </a>
        </div>
      </CyberCard>
    </div>
  );
}
