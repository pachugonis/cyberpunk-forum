import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { GlitchText } from "@/components/cyberpunk";
import { LayoutDashboard, FolderTree, Users, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#2a2a35] bg-[#0a0a0f]/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-[var(--cyber-cyan)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-sm">Exit Admin</span>
            </Link>
            <div className="h-6 w-px bg-[#2a2a35]" />
            <GlitchText
              text="ADMIN PANEL"
              className="text-lg font-bold text-[var(--cyber-magenta)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Logged in as {session.user.name}
            </span>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-mono text-muted-foreground hover:text-[var(--cyber-magenta)] hover:bg-[#13131a] transition-colors rounded-none clip-cyber"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
