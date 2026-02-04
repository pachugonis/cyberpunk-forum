-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "badges_userId_idx" ON "badges"("userId");

-- CreateIndex
CREATE INDEX "badges_badgeType_idx" ON "badges"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "badges_userId_badgeType_key" ON "badges"("userId", "badgeType");