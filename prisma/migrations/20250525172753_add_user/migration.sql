-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "carryingCapacity" REAL NOT NULL,
    "platformLength" REAL,
    "platformWidth" REAL,
    "description" TEXT,
    "workPeriod" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "minOrderTime" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Transport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
