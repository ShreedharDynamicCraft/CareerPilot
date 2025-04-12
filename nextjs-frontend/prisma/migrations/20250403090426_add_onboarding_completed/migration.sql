/*
  Warnings:

  - You are about to drop the column `cityWiseSalary` on the `IndustryInsight` table. All the data in the column will be lost.
  - You are about to drop the column `govtJobs` on the `IndustryInsight` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "cityWiseSalary",
DROP COLUMN "govtJobs";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "structuredData" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" SET NOT NULL;
