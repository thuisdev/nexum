-- AlterEnum
ALTER TYPE "EscrowStatus" ADD VALUE 'SPLIT';

-- AlterTable
ALTER TABLE "Approval" ADD COLUMN "refundTxRef" TEXT;
