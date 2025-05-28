-- CreateTable
CREATE TABLE "TransportResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "transportId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "TransportResponse_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Transport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransportResponse_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseId" TEXT,
    "transportResponseId" TEXT,
    "senderId" TEXT NOT NULL,
    "chatType" TEXT,
    "chatId" TEXT,
    CONSTRAINT "Message_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_transportResponseId_fkey" FOREIGN KEY ("transportResponseId") REFERENCES "TransportResponse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId") SELECT "chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
