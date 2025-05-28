-- CreateTable
CREATE TABLE "PrivateChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transportId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivateChat_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Transport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrivateChat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrivateChat_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseId" TEXT,
    "senderId" TEXT NOT NULL,
    "chatType" TEXT,
    "chatId" TEXT,
    "privateChatId" TEXT,
    CONSTRAINT "Message_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_privateChatId_fkey" FOREIGN KEY ("privateChatId") REFERENCES "PrivateChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId") SELECT "chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PrivateChat_transportId_ownerId_clientId_key" ON "PrivateChat"("transportId", "ownerId", "clientId");
