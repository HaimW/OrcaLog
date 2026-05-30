-- AlterTable
ALTER TABLE "DiveEntry" ADD COLUMN "shareToken" TEXT;
ALTER TABLE "DiveEntry" ADD COLUMN "groupId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DiveEntry_shareToken_key" ON "DiveEntry"("shareToken");
CREATE INDEX "DiveEntry_groupId_idx" ON "DiveEntry"("groupId");
