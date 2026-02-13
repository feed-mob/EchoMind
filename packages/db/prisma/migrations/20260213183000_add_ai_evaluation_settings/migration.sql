-- CreateTable
CREATE TABLE "AiEvaluationSetting" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "impactWeight" INTEGER NOT NULL,
    "feasibilityWeight" INTEGER NOT NULL,
    "originalityWeight" INTEGER NOT NULL,
    "selectedIdeaIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiEvaluationSetting_groupId_createdAt_idx" ON "AiEvaluationSetting"("groupId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AiEvaluationSetting_goalId_idx" ON "AiEvaluationSetting"("goalId");

-- AddForeignKey
ALTER TABLE "AiEvaluationSetting" ADD CONSTRAINT "AiEvaluationSetting_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEvaluationSetting" ADD CONSTRAINT "AiEvaluationSetting_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
