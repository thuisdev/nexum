-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'INVITE_DECLINED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarColor" TEXT;
