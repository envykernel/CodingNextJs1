/*
  Warnings:

  - Made the column `status` on table `patient_visit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "patient_visit" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'scheduled',
ALTER COLUMN "status" SET DATA TYPE TEXT;
