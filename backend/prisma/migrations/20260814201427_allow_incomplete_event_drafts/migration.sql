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
    "capacity" INTEGER,
    "venueName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "latitude" REAL,
    "longitude" REAL,
    "dateTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizerId" TEXT NOT NULL,
    "categoryTemplateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_categoryTemplateId_fkey" FOREIGN KEY ("categoryTemplateId") REFERENCES "EventCategoryTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("address", "capacity", "categoryTemplateId", "city", "country", "createdAt", "dateTime", "description", "externalId", "id", "imageUrl", "latitude", "longitude", "organizerId", "source", "state", "status", "title", "updatedAt", "venueName") SELECT "address", "capacity", "categoryTemplateId", "city", "country", "createdAt", "dateTime", "description", "externalId", "id", "imageUrl", "latitude", "longitude", "organizerId", "source", "state", "status", "title", "updatedAt", "venueName" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");
CREATE INDEX "Event_categoryTemplateId_idx" ON "Event"("categoryTemplateId");
CREATE INDEX "Event_city_idx" ON "Event"("city");
CREATE INDEX "Event_dateTime_idx" ON "Event"("dateTime");
CREATE INDEX "Event_source_idx" ON "Event"("source");
CREATE UNIQUE INDEX "Event_organizerId_source_externalId_key" ON "Event"("organizerId", "source", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
