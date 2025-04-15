/*
  Warnings:

  - You are about to drop the column `paypalId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paypalOrderId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paypalId",
DROP COLUMN "paypalOrderId",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "midtransId" TEXT,
ADD COLUMN     "midtransOrderId" TEXT,
ADD COLUMN     "midtransResponse" JSONB,
ADD COLUMN     "midtransToken" TEXT;
