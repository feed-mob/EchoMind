-- AlterTable
ALTER TABLE "MoodRedemption" ADD COLUMN     "imageData" TEXT,
ADD COLUMN     "imageGenAt" TIMESTAMP(3),
ADD COLUMN     "imageStatus" TEXT NOT NULL DEFAULT 'pending';
