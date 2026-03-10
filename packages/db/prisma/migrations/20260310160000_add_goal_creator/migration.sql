ALTER TABLE "Goal" ADD COLUMN "creatorId" TEXT;

UPDATE "Goal" AS goal
SET "creatorId" = idea."authorId"
FROM "Idea" AS idea
WHERE goal."selectedIdeaId" = idea."id"
  AND goal."creatorId" IS NULL;

UPDATE "Goal" AS goal
SET "creatorId" = member."userId"
FROM (
  SELECT DISTINCT ON ("groupId")
    "groupId",
    "userId"
  FROM "GroupMember"
  ORDER BY
    "groupId",
    CASE WHEN "role" = 'admin' THEN 0 ELSE 1 END,
    "joinedAt" ASC
) AS member
WHERE goal."groupId" = member."groupId"
  AND goal."creatorId" IS NULL;

ALTER TABLE "Goal" ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Goal_creatorId_idx" ON "Goal"("creatorId");
