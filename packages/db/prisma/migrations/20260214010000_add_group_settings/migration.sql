-- AlterTable
ALTER TABLE "Group"
ADD COLUMN "publicAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "aiCollaborationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "workspaceVisibility" TEXT NOT NULL DEFAULT 'Members only';
