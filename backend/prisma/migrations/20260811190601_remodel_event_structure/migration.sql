/*
  Warnings:

  - You are about to drop the column `category` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketType` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Seat` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryTemplateId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceFeeInCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalInCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventSectorId` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedLabel` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTicketCategoryId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketBatchId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceInCents` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "EventCategoryTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SectorTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModalityTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceCategoryTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventSector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "sectorTemplateId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventSector_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventSector_sectorTemplateId_fkey" FOREIGN KEY ("sectorTemplateId") REFERENCES "SectorTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventSectorModality" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorId" TEXT NOT NULL,
    "modalityTemplateId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "occupancyMode" TEXT NOT NULL DEFAULT 'QUANTITY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventSectorModality_eventSectorId_fkey" FOREIGN KEY ("eventSectorId") REFERENCES "EventSector" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventSectorModality_modalityTemplateId_fkey" FOREIGN KEY ("modalityTemplateId") REFERENCES "ModalityTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventTicketCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorModalityId" TEXT NOT NULL,
    "priceCategoryTemplateId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventTicketCategory_eventSectorModalityId_fkey" FOREIGN KEY ("eventSectorModalityId") REFERENCES "EventSectorModality" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventTicketCategory_priceCategoryTemplateId_fkey" FOREIGN KEY ("priceCategoryTemplateId") REFERENCES "PriceCategoryTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventTicketCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketBatch_eventTicketCategoryId_fkey" FOREIGN KEY ("eventTicketCategoryId") REFERENCES "EventTicketCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'LOCAL',
    "externalId" TEXT,
    "imageUrl" TEXT,
    "capacity" INTEGER NOT NULL,
    "venueName" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "latitude" REAL,
    "longitude" REAL,
    "dateTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizerId" TEXT NOT NULL,
    "categoryTemplateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_categoryTemplateId_fkey" FOREIGN KEY ("categoryTemplateId") REFERENCES "EventCategoryTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "dateTime", "description", "externalId", "id", "organizerId", "title") SELECT "createdAt", "dateTime", "description", "externalId", "id", "organizerId", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "subtotalInCents" INTEGER NOT NULL,
    "serviceFeeRateBps" INTEGER NOT NULL DEFAULT 1200,
    "serviceFeeInCents" INTEGER NOT NULL,
    "totalInCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("clientId", "createdAt", "id", "status") SELECT "clientId", "createdAt", "id", "status" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Seat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "normalizedLabel" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Seat_eventSectorId_fkey" FOREIGN KEY ("eventSectorId") REFERENCES "EventSector" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Seat" ("id", "isAvailable", "label") SELECT "id", "isAvailable", "label" FROM "Seat";
DROP TABLE "Seat";
ALTER TABLE "new_Seat" RENAME TO "Seat";
CREATE UNIQUE INDEX "Seat_eventSectorId_normalizedLabel_key" ON "Seat"("eventSectorId", "normalizedLabel");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "eventTicketCategoryId" TEXT NOT NULL,
    "ticketBatchId" TEXT NOT NULL,
    "seatId" TEXT,
    "unitPriceInCents" INTEGER NOT NULL,
    "qrCodeHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "sharedToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_eventTicketCategoryId_fkey" FOREIGN KEY ("eventTicketCategoryId") REFERENCES "EventTicketCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_ticketBatchId_fkey" FOREIGN KEY ("ticketBatchId") REFERENCES "TicketBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("createdAt", "id", "orderId", "qrCodeHash", "seatId", "sharedToken", "status") SELECT "createdAt", "id", "orderId", "qrCodeHash", "seatId", "sharedToken", "status" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_qrCodeHash_key" ON "Ticket"("qrCodeHash");
CREATE UNIQUE INDEX "Ticket_sharedToken_key" ON "Ticket"("sharedToken");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "role") SELECT "createdAt", "email", "id", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EventCategoryTemplate_normalizedName_key" ON "EventCategoryTemplate"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "SectorTemplate_normalizedName_key" ON "SectorTemplate"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "ModalityTemplate_normalizedName_key" ON "ModalityTemplate"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "PriceCategoryTemplate_normalizedName_key" ON "PriceCategoryTemplate"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "EventSector_eventId_sectorTemplateId_key" ON "EventSector"("eventId", "sectorTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSectorModality_eventSectorId_modalityTemplateId_key" ON "EventSectorModality"("eventSectorId", "modalityTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTicketCategory_eventSectorModalityId_priceCategoryTemplateId_key" ON "EventTicketCategory"("eventSectorModalityId", "priceCategoryTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketBatch_eventTicketCategoryId_normalizedName_key" ON "TicketBatch"("eventTicketCategoryId", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "TicketBatch_eventTicketCategoryId_sequence_key" ON "TicketBatch"("eventTicketCategoryId", "sequence");
