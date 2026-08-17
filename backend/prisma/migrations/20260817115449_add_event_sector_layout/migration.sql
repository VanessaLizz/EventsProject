/*
  Warnings:

  - A unique constraint covering the columns `[eventId,layoutRow,layoutColumn]` on the table `EventSector` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EventSector" ADD COLUMN "layoutColumn" INTEGER;
ALTER TABLE "EventSector" ADD COLUMN "layoutRow" INTEGER;

-- CreateIndex
CREATE INDEX "EventSector_eventId_layoutRow_layoutColumn_idx" ON "EventSector"("eventId", "layoutRow", "layoutColumn");

-- CreateIndex
CREATE UNIQUE INDEX "EventSector_eventId_layoutRow_layoutColumn_key" ON "EventSector"("eventId", "layoutRow", "layoutColumn");
