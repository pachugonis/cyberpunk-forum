import { isAbsolute, join, resolve } from "path";

/**
 * Absolute path of the SQLite database from DATABASE_URL (default
 * file:./dev.db). Like classic Prisma, relative paths are resolved against
 * the prisma/ directory, so file:./dev.db means prisma/dev.db.
 * Shared by the app, prisma.config.ts and the seed script so they all use
 * the same file.
 */
export function databaseFilePath(): string {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (!url.startsWith("file:")) {
    throw new Error(`DATABASE_URL must be a SQLite file: URL, got "${url}"`);
  }
  // file:///abs/path -> /abs/path
  const path = url.slice("file:".length).replace(/^\/\/(?=\/)/, "");
  return isAbsolute(path)
    ? path
    : resolve(join(/* turbopackIgnore: true */ process.cwd(), "prisma"), path);
}

export function databaseUrl(): string {
  return `file:${databaseFilePath()}`;
}
