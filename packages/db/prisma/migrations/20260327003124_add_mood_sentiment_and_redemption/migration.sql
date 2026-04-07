/*
  Warnings:

  - Added the required column `sentiment` to the `Mood` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mood" ADD COLUMN     "dailySummaryId" TEXT,
ADD COLUMN     "sentiment" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MoodDailySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sentiment" TEXT NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "redemptionType" TEXT,
    "totalMoods" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodDailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "baseCount" INTEGER NOT NULL,
    "extraCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL,
    "reward" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoodDailySummary_userId_date_idx" ON "MoodDailySummary"("userId", "date");

-- CreateIndex
CREATE INDEX "MoodDailySummary_sentiment_isRedeemed_userId_idx" ON "MoodDailySummary"("sentiment", "isRedeemed", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MoodDailySummary_userId_date_key" ON "MoodDailySummary"("userId", "date");

-- CreateIndex
CREATE INDEX "MoodRedemption_userId_createdAt_idx" ON "MoodRedemption"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MoodRedemption_sentiment_idx" ON "MoodRedemption"("sentiment");

-- CreateIndex
CREATE INDEX "Mood_sentiment_dailySummaryId_idx" ON "Mood"("sentiment", "dailySummaryId");

-- AddForeignKey
ALTER TABLE "Mood" ADD CONSTRAINT "Mood_dailySummaryId_fkey" FOREIGN KEY ("dailySummaryId") REFERENCES "MoodDailySummary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodDailySummary" ADD CONSTRAINT "MoodDailySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodRedemption" ADD CONSTRAINT "MoodRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
