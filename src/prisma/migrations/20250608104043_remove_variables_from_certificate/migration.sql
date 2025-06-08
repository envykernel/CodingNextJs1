/*
  Warnings:

  - You are about to drop the column `variables` on the `Certificate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "variables";

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;
