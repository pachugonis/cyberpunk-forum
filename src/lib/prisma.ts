import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  });
  const client = new PrismaClient({ adapter });

  // WAL lets reads proceed while a write is in progress. The mode is stored in
  // the database file itself, so it applies to every connection.
  client
    .$queryRawUnsafe("PRAGMA journal_mode = WAL")
    .catch((error) => console.error("Failed to enable SQLite WAL mode:", error));

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
