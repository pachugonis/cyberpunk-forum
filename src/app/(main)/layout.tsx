import { Navbar, Sidebar, Footer } from "@/components/layout";
import { prisma } from "@/lib/prisma";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { topics: true },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container px-4 py-6">
        <div className="flex gap-6">
          <Sidebar categories={categories} className="hidden lg:block" />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
