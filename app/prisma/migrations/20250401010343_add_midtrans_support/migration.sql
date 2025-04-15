/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentAmount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentCurrency` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `pendingProvider` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `pendingTier` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `providerSessionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `providerSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `PaymentHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PaymentHistory" DROP CONSTRAINT "PaymentHistory_userId_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "expiresAt",
DROP COLUMN "lastPaymentAmount",
DROP COLUMN "lastPaymentCurrency",
DROP COLUMN "lastPaymentDate",
DROP COLUMN "metadata",
DROP COLUMN "pendingProvider",
DROP COLUMN "pendingTier",
DROP COLUMN "providerSessionId",
DROP COLUMN "providerSubscriptionId",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "paypalPlanId" TEXT,
ADD COLUMN     "paypalSubscriptionId" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "PaymentHistory";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paypalSubscriptionId_key" ON "Subscription"("paypalSubscriptionId");
