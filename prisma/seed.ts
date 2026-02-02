import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaLibSql({
  url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nightcity.com" },
    update: {},
    create: {
      email: "admin@nightcity.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      bio: "System administrator of NightCity Forum",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "v@nightcity.com" },
    update: {},
    create: {
      email: "v@nightcity.com",
      name: "V",
      password: userPassword,
      role: "USER",
      bio: "Just another merc trying to survive in Night City.",
    },
  });
  console.log("Created test user:", user.email);

  // Create categories
  const categories = [
    {
      name: "General Discussion",
      slug: "general",
      description: "Talk about anything related to life in Night City",
      icon: "MessageSquare",
      color: "#00f0ff",
      order: 1,
    },
    {
      name: "Netrunning",
      slug: "netrunning",
      description: "Hacking, ICE breaking, and all things cyberspace",
      icon: "Cpu",
      color: "#ff00ff",
      order: 2,
    },
    {
      name: "Chrome & Cyberware",
      slug: "cyberware",
      description: "Body modifications, implants, and enhancements",
      icon: "Zap",
      color: "#fcee0a",
      order: 3,
    },
    {
      name: "Fixers & Gigs",
      slug: "gigs",
      description: "Find work, share job opportunities, and connect with fixers",
      icon: "Shield",
      color: "#9d00ff",
      order: 4,
    },
    {
      name: "Tech Talk",
      slug: "tech",
      description: "Weapons, vehicles, and gadgets discussion",
      icon: "Code",
      color: "#ff006e",
      order: 5,
    },
    {
      name: "Off-Topic",
      slug: "off-topic",
      description: "Everything else that doesn't fit elsewhere",
      icon: "Gamepad2",
      color: "#00ff88",
      order: 6,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    console.log("Created category:", category.name);
  }

  // Get categories for topics
  const generalCategory = await prisma.category.findUnique({ where: { slug: "general" } });
  const netrunningCategory = await prisma.category.findUnique({ where: { slug: "netrunning" } });
  const cyberwareCategory = await prisma.category.findUnique({ where: { slug: "cyberware" } });

  if (generalCategory && netrunningCategory && cyberwareCategory) {
    // Create sample topics
    const topics = [
      {
        title: "Welcome to NightCity Forum!",
        content: `Welcome, chooms! This is the official NightCity Forum - the underground network for netrunners, fixers, and edgerunners.

Here you can:
- Discuss the latest happenings in Night City
- Share tips and tricks for surviving on the streets
- Connect with fellow mercs and fixers
- Talk tech, chrome, and everything in between

Remember to keep it civil. We're all just trying to survive out here.

Stay safe out there, samurai.`,
        isPinned: true,
        authorId: admin.id,
        categoryId: generalCategory.id,
      },
      {
        title: "Best ICE breakers for 2077?",
        content: `Hey chooms, I've been running into some serious black ICE lately. The corps are stepping up their security.

What's everyone using these days for quick breaches? I've been relying on the old Ping cascade but it's getting stale.

Looking for recommendations on:
- Quick breach protocols
- Anti-trace software
- Recovery daemons

Share your loadouts!`,
        authorId: user.id,
        categoryId: netrunningCategory.id,
      },
      {
        title: "Mantis Blades vs Gorilla Arms - The Eternal Debate",
        content: `Let's settle this once and for all.

I've been running Mantis Blades for years but I'm thinking about switching to Gorilla Arms. The hydraulic power seems useful for more than just combat.

What are your thoughts? Any recommendations on ripperdocs who do quality work?

Current setup:
- Mantis Blades (Thermal)
- Reinforced tendons
- Subdermal armor

Thinking about:
- Gorilla Arms (Electrical)
- Better leg cyberware
- Maybe some optical upgrades`,
        authorId: user.id,
        categoryId: cyberwareCategory.id,
      },
    ];

    for (const topic of topics) {
      const existingTopic = await prisma.topic.findFirst({
        where: { title: topic.title },
      });

      if (!existingTopic) {
        const created = await prisma.topic.create({ data: topic });
        console.log("Created topic:", created.title);

        // Add sample comments
        if (topic.title.includes("Welcome")) {
          await prisma.comment.create({
            data: {
              content: "Great to be here! Looking forward to connecting with fellow edgerunners.",
              authorId: user.id,
              topicId: created.id,
            },
          });
        }

        if (topic.title.includes("ICE")) {
          await prisma.comment.create({
            data: {
              content: "I've been using a custom Daemon cascade. Hit me up if you want the specs.",
              authorId: admin.id,
              topicId: created.id,
            },
          });
        }
      }
    }
  }

  console.log("Seeding completed!");
  console.log("\nTest accounts:");
  console.log("Admin: admin@nightcity.com / admin123");
  console.log("User: v@nightcity.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
