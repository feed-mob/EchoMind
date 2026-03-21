-- AlterTable
ALTER TABLE "Mood" ADD COLUMN     "cycleCompletedAt" TIMESTAMP(3),
ADD COLUMN     "rewardRedeemed" BOOLEAN NOT NULL DEFAULT false;
