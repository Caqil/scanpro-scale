/*
  Warnings:

  - You are about to drop the column `cancelAtPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `midtransId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `midtransOrderId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `midtransResponse` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `midtransToken` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "cancelAtPeriodEnd",
DROP COLUMN "expiresAt",
DROP COLUMN "midtransId",
DROP COLUMN "midtransOrderId",
DROP COLUMN "midtransResponse",
DROP COLUMN "midtransToken",
DROP COLUMN "planId",
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "paypalPlanId" TEXT,
ADD COLUMN     "paypalSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paypalSubscriptionId_key" ON "Subscription"("paypalSubscriptionId");
