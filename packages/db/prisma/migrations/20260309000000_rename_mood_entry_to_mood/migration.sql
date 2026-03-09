-- RenameTable
ALTER TABLE "MoodEntry" RENAME TO "Mood";

-- RenameIndex
ALTER INDEX "MoodEntry_pkey" RENAME TO "Mood_pkey";

-- RenameIndex
ALTER INDEX "MoodEntry_userId_recordedAt_idx" RENAME TO "Mood_userId_recordedAt_idx";

-- RenameIndex
ALTER INDEX "MoodEntry_userId_idx" RENAME TO "Mood_userId_idx";

-- RenameForeignKey
ALTER TABLE "Mood" RENAME CONSTRAINT "MoodEntry_userId_fkey" TO "Mood_userId_fkey";
