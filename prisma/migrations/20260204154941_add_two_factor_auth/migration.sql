-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "recoveryCode" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "bio" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("bio", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "recoveryCode", "reputation", "role", "updatedAt") SELECT "bio", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "recoveryCode", "reputation", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
