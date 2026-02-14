-- AlterTable
ALTER TABLE "Goal"
  ADD COLUMN "selectedIdeaId" TEXT,
  ADD COLUMN "selectedSettingId" TEXT;

-- CreateIndex
CREATE INDEX "Goal_selectedIdeaId_idx" ON "Goal"("selectedIdeaId");

-- CreateIndex
CREATE INDEX "Goal_selectedSettingId_idx" ON "Goal"("selectedSettingId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_selectedIdeaId_fkey" FOREIGN KEY ("selectedIdeaId") REFERENCES "Idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_selectedSettingId_fkey" FOREIGN KEY ("selectedSettingId") REFERENCES "AiEvaluationSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
