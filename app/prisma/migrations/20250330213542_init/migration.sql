/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ApiKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" TEXT NOT NULL DEFAULT 'paypal',
ADD COLUMN     "paypalPlanId" TEXT,
ADD COLUMN     "paypalSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "UsageStats" ALTER COLUMN "date" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PaypalWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaypalWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaypalWebhookEvent_resourceId_idx" ON "PaypalWebhookEvent"("resourceId");

-- CreateIndex
CREATE INDEX "PaypalWebhookEvent_eventType_idx" ON "PaypalWebhookEvent"("eventType");
