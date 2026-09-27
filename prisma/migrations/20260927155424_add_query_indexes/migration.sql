-- DropIndex
DROP INDEX "badges_userId_idx";

-- DropIndex
DROP INDEX "comments_topicId_idx";

-- DropIndex
DROP INDEX "messages_receiverId_idx";

-- DropIndex
DROP INDEX "messages_senderId_idx";

-- DropIndex
DROP INDEX "reports_status_idx";

-- DropIndex
DROP INDEX "topics_categoryId_idx";

-- CreateIndex
CREATE INDEX "comments_topicId_createdAt_idx" ON "comments"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_receiverId_createdAt_idx" ON "messages"("senderId", "receiverId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_receiverId_isRead_idx" ON "messages"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "reports_status_createdAt_idx" ON "reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "topics_categoryId_deletedAt_isPinned_createdAt_idx" ON "topics"("categoryId", "deletedAt", "isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "topics_deletedAt_isPinned_createdAt_idx" ON "topics"("deletedAt", "isPinned", "createdAt");
