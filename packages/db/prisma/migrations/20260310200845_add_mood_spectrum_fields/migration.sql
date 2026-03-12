-- AlterTable
ALTER TABLE "Mood" ADD COLUMN "spectrum" TEXT;
ALTER TABLE "Mood" ADD COLUMN "color" TEXT;
ALTER TABLE "Mood" ADD COLUMN "icon" TEXT;
ALTER TABLE "Mood" ADD COLUMN "intensity" INTEGER;

-- CreateIndex
CREATE INDEX "Mood_spectrum_idx" ON "Mood"("spectrum");
