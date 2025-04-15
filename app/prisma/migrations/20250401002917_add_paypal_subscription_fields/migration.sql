/*
  Warnings:

  - You are about to drop the column `currentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodStart` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalPlanId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalSubscriptionId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subscription_paypalSubscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "currentPeriodEnd",
DROP COLUMN "currentPeriodStart",
DROP COLUMN "paypalPlanId",
DROP COLUMN "paypalSubscriptionId",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastPaymentAmount" DOUBLE PRECISION,
ADD COLUMN     "lastPaymentCurrency" TEXT,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pendingProvider" TEXT,
ADD COLUMN     "pendingTier" TEXT,
ADD COLUMN     "providerSessionId" TEXT,
ADD COLUMN     "providerSubscriptionId" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
