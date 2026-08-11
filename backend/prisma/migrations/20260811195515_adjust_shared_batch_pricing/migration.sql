/*
  Warnings:

  - You are about to drop the column `quantity` on the `EventTicketCategory` table. All the data in the column will be lost.
  - You are about to drop the column `eventSectorId` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `eventTicketCategoryId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `ticketBatchId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `eventTicketCategoryId` on the `TicketBatch` table. All the data in the column will be lost.
  - You are about to drop the column `priceInCents` on the `TicketBatch` table. All the data in the column will be lost.
  - Added the required column `eventSectorModalityId` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketBatchPriceId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventSectorModalityId` to the `TicketBatch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PriceQuotaGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "maxPercentage" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TicketBatchPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketBatchId" TEXT NOT NULL,
    "eventTicketCategoryId" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketBatchPrice_ticketBatchId_fkey" FOREIGN KEY ("ticketBatchId") REFERENCES "TicketBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketBatchPrice_eventTicketCategoryId_fkey" FOREIGN KEY ("eventTicketCategoryId") REFERENCES "EventTicketCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventTicketCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorModalityId" TEXT NOT NULL,
    "priceCategoryTemplateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventTicketCategory_eventSectorModalityId_fkey" FOREIGN KEY ("eventSectorModalityId") REFERENCES "EventSectorModality" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventTicketCategory_priceCategoryTemplateId_fkey" FOREIGN KEY ("priceCategoryTemplateId") REFERENCES "PriceCategoryTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventTicketCategory" ("createdAt", "eventSectorModalityId", "id", "priceCategoryTemplateId", "updatedAt") SELECT "createdAt", "eventSectorModalityId", "id", "priceCategoryTemplateId", "updatedAt" FROM "EventTicketCategory";
DROP TABLE "EventTicketCategory";
ALTER TABLE "new_EventTicketCategory" RENAME TO "EventTicketCategory";
CREATE INDEX "EventTicketCategory_eventSectorModalityId_idx" ON "EventTicketCategory"("eventSectorModalityId");
CREATE INDEX "EventTicketCategory_priceCategoryTemplateId_idx" ON "EventTicketCategory"("priceCategoryTemplateId");
CREATE UNIQUE INDEX "EventTicketCategory_eventSectorModalityId_priceCategoryTemplateId_key" ON "EventTicketCategory"("eventSectorModalityId", "priceCategoryTemplateId");
CREATE TABLE "new_PriceCategoryTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "quotaGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriceCategoryTemplate_quotaGroupId_fkey" FOREIGN KEY ("quotaGroupId") REFERENCES "PriceQuotaGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PriceCategoryTemplate" ("createdAt", "id", "isActive", "name", "normalizedName", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "normalizedName", "updatedAt" FROM "PriceCategoryTemplate";
DROP TABLE "PriceCategoryTemplate";
ALTER TABLE "new_PriceCategoryTemplate" RENAME TO "PriceCategoryTemplate";
CREATE UNIQUE INDEX "PriceCategoryTemplate_normalizedName_key" ON "PriceCategoryTemplate"("normalizedName");
CREATE INDEX "PriceCategoryTemplate_quotaGroupId_idx" ON "PriceCategoryTemplate"("quotaGroupId");
CREATE TABLE "new_Seat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorModalityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "normalizedLabel" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Seat_eventSectorModalityId_fkey" FOREIGN KEY ("eventSectorModalityId") REFERENCES "EventSectorModality" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Seat" ("createdAt", "id", "isAvailable", "label", "normalizedLabel", "updatedAt") SELECT "createdAt", "id", "isAvailable", "label", "normalizedLabel", "updatedAt" FROM "Seat";
DROP TABLE "Seat";
ALTER TABLE "new_Seat" RENAME TO "Seat";
CREATE INDEX "Seat_eventSectorModalityId_idx" ON "Seat"("eventSectorModalityId");
CREATE UNIQUE INDEX "Seat_eventSectorModalityId_normalizedLabel_key" ON "Seat"("eventSectorModalityId", "normalizedLabel");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "ticketBatchPriceId" TEXT NOT NULL,
    "seatId" TEXT,
    "unitPriceInCents" INTEGER NOT NULL,
    "qrCodeHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "sharedToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_ticketBatchPriceId_fkey" FOREIGN KEY ("ticketBatchPriceId") REFERENCES "TicketBatchPrice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("createdAt", "id", "orderId", "qrCodeHash", "seatId", "sharedToken", "status", "unitPriceInCents", "updatedAt") SELECT "createdAt", "id", "orderId", "qrCodeHash", "seatId", "sharedToken", "status", "unitPriceInCents", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_qrCodeHash_key" ON "Ticket"("qrCodeHash");
CREATE UNIQUE INDEX "Ticket_sharedToken_key" ON "Ticket"("sharedToken");
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");
CREATE INDEX "Ticket_ticketBatchPriceId_idx" ON "Ticket"("ticketBatchPriceId");
CREATE INDEX "Ticket_seatId_idx" ON "Ticket"("seatId");
CREATE TABLE "new_TicketBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSectorModalityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketBatch_eventSectorModalityId_fkey" FOREIGN KEY ("eventSectorModalityId") REFERENCES "EventSectorModality" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TicketBatch" ("createdAt", "id", "isActive", "name", "normalizedName", "quantity", "sequence", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "normalizedName", "quantity", "sequence", "updatedAt" FROM "TicketBatch";
DROP TABLE "TicketBatch";
ALTER TABLE "new_TicketBatch" RENAME TO "TicketBatch";
CREATE INDEX "TicketBatch_eventSectorModalityId_idx" ON "TicketBatch"("eventSectorModalityId");
CREATE UNIQUE INDEX "TicketBatch_eventSectorModalityId_normalizedName_key" ON "TicketBatch"("eventSectorModalityId", "normalizedName");
CREATE UNIQUE INDEX "TicketBatch_eventSectorModalityId_sequence_key" ON "TicketBatch"("eventSectorModalityId", "sequence");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PriceQuotaGroup_normalizedName_key" ON "PriceQuotaGroup"("normalizedName");

-- CreateIndex
CREATE INDEX "TicketBatchPrice_ticketBatchId_idx" ON "TicketBatchPrice"("ticketBatchId");

-- CreateIndex
CREATE INDEX "TicketBatchPrice_eventTicketCategoryId_idx" ON "TicketBatchPrice"("eventTicketCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketBatchPrice_ticketBatchId_eventTicketCategoryId_key" ON "TicketBatchPrice"("ticketBatchId", "eventTicketCategoryId");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_categoryTemplateId_idx" ON "Event"("categoryTemplateId");

-- CreateIndex
CREATE INDEX "Event_city_idx" ON "Event"("city");

-- CreateIndex
CREATE INDEX "Event_dateTime_idx" ON "Event"("dateTime");

-- CreateIndex
CREATE INDEX "Event_source_idx" ON "Event"("source");

-- CreateIndex
CREATE INDEX "EventSector_eventId_idx" ON "EventSector"("eventId");

-- CreateIndex
CREATE INDEX "EventSector_sectorTemplateId_idx" ON "EventSector"("sectorTemplateId");

-- CreateIndex
CREATE INDEX "EventSectorModality_eventSectorId_idx" ON "EventSectorModality"("eventSectorId");

-- CreateIndex
CREATE INDEX "EventSectorModality_modalityTemplateId_idx" ON "EventSectorModality"("modalityTemplateId");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");
