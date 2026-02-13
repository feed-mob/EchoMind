-- CreateTable
CREATE TABLE "AiEvaluationResult" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "feasibilityScore" INTEGER NOT NULL,
    "originalityScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluationResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiEvaluationResult_settingId_ideaId_key" ON "AiEvaluationResult"("settingId", "ideaId");

-- CreateIndex
CREATE INDEX "AiEvaluationResult_settingId_rank_idx" ON "AiEvaluationResult"("settingId", "rank");

-- AddForeignKey
ALTER TABLE "AiEvaluationResult" ADD CONSTRAINT "AiEvaluationResult_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "AiEvaluationSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEvaluationResult" ADD CONSTRAINT "AiEvaluationResult_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
