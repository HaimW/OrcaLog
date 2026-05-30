-- AlterTable
ALTER TABLE "User" ADD COLUMN "showInLeaderboard" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN "leaderboardEnabled" BOOLEAN NOT NULL DEFAULT false;
