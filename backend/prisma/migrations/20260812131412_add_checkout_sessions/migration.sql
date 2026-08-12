-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CheckoutSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckoutItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkoutSessionId" TEXT NOT NULL,
    "ticketBatchPriceId" TEXT NOT NULL,
    "seatId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CheckoutItem_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "CheckoutSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckoutItem_ticketBatchPriceId_fkey" FOREIGN KEY ("ticketBatchPriceId") REFERENCES "TicketBatchPrice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckoutItem_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CheckoutSession_clientId_idx" ON "CheckoutSession"("clientId");

-- CreateIndex
CREATE INDEX "CheckoutSession_status_idx" ON "CheckoutSession"("status");

-- CreateIndex
CREATE INDEX "CheckoutSession_expiresAt_idx" ON "CheckoutSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CheckoutItem_checkoutSessionId_idx" ON "CheckoutItem"("checkoutSessionId");

-- CreateIndex
CREATE INDEX "CheckoutItem_ticketBatchPriceId_idx" ON "CheckoutItem"("ticketBatchPriceId");

-- CreateIndex
CREATE INDEX "CheckoutItem_seatId_idx" ON "CheckoutItem"("seatId");
