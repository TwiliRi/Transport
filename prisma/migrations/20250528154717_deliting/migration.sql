/*
  Warnings:

  - You are about to drop the `TransportResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `transportResponseId` on the `Message` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TransportResponse";
PRAGMA foreign_keys=on;

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
    CONSTRAINT "Message_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId") SELECT "chatId", "chatType", "content", "createdAt", "id", "responseId", "senderId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
