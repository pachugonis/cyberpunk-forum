-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordChangedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topicId" TEXT,
    "commentId" TEXT,
    "uploaderId" TEXT,
    CONSTRAINT "attachments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_attachments" ("commentId", "createdAt", "filename", "id", "mimeType", "originalName", "size", "topicId", "url") SELECT "commentId", "createdAt", "filename", "id", "mimeType", "originalName", "size", "topicId", "url" FROM "attachments";
DROP TABLE "attachments";
ALTER TABLE "new_attachments" RENAME TO "attachments";
CREATE INDEX "attachments_topicId_idx" ON "attachments"("topicId");
CREATE INDEX "attachments_commentId_idx" ON "attachments"("commentId");
CREATE INDEX "attachments_uploaderId_idx" ON "attachments"("uploaderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
