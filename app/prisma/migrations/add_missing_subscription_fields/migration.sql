-- Add missing fields to Subscription table
ALTER TABLE "Subscription" 
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "failedPaymentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "usageResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Check if UsageStats exists, if not create it
CREATE TABLE IF NOT EXISTS "UsageStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageStats_pkey" PRIMARY KEY ("id")
);

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "UsageStats_userId_operation_date_key" ON "UsageStats"("userId", "operation", "date");

-- Add foreign key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'UsageStats_userId_fkey'
    ) THEN
        ALTER TABLE "UsageStats" ADD CONSTRAINT "UsageStats_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;