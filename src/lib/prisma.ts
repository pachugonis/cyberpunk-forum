import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { existsSync } from "fs";
import { databaseFilePath } from "./database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // `next build` runs layout queries while probing pages for static rendering.
  // Point it at an in-memory database so the build never opens (and thereby
  // creates) the real database file; those pages end up dynamic anyway.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return new PrismaClient({ adapter: new PrismaLibSql({ url: ":memory:" }) });
  }

  const dbPath = databaseFilePath();
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  const client = new PrismaClient({ adapter });

  // SQLite silently creates a missing file; in production that would mean an
  // empty forum, so refuse to start instead (run `prisma migrate deploy` first)
  if (process.env.NODE_ENV === "production" && !existsSync(dbPath)) {
    throw new Error(
      `Database file not found: ${dbPath}. Check DATABASE_URL or run "npx prisma migrate deploy".`
    );
  }

  // WAL lets reads proceed while a write is in progress. The mode is stored in
  // the database file itself, so it applies to every connection.
  client
    .$queryRawUnsafe("PRAGMA journal_mode = WAL")
    .catch((error) => console.error("Failed to enable SQLite WAL mode:", error));

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
