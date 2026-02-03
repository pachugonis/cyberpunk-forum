-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");

-- CreateIndex
CREATE INDEX "topics_createdAt_idx" ON "topics"("createdAt");

-- CreateIndex
CREATE INDEX "topics_isPinned_createdAt_idx" ON "topics"("isPinned", "createdAt");
