-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "latestScore" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Lead_latestScore_idx" ON "Lead"("latestScore");
