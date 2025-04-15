/*
  Warnings:

  - You are about to drop the column `paymentProvider` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalPlanId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `revenueCatId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `PaypalWebhookEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentProvider",
DROP COLUMN "paypalPlanId",
DROP COLUMN "paypalSubscriptionId",
DROP COLUMN "revenueCatId",
ADD COLUMN     "paypalId" TEXT,
ADD COLUMN     "paypalOrderId" TEXT,
ADD COLUMN     "planId" TEXT;

-- DropTable
DROP TABLE "PaypalWebhookEvent";
