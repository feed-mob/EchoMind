-- Create GoalSource table
CREATE TABLE "GoalSource" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalSource_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "GoalSource_goalId_idx" ON "GoalSource"("goalId");
CREATE INDEX "GoalSource_type_idx" ON "GoalSource"("type");

-- Add foreign key constraint
ALTER TABLE "GoalSource" ADD CONSTRAINT "GoalSource_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
