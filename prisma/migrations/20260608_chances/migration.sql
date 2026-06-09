-- Add chances to User
ALTER TABLE "User" ADD COLUMN "chances" INTEGER NOT NULL DEFAULT 1;

-- Add chanceNumber to Prediction
ALTER TABLE "Prediction" ADD COLUMN "chanceNumber" INTEGER NOT NULL DEFAULT 1;

-- Drop old unique index and create new one
DROP INDEX IF EXISTS "Prediction_userId_matchId_key";
CREATE UNIQUE INDEX "Prediction_userId_matchId_chanceNumber_key" ON "Prediction"("userId", "matchId", "chanceNumber");
