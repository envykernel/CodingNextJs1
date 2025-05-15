/*
  Warnings:

  - You are about to drop the column `arrival_time` on the `patient_visit` table. All the data in the column will be lost.
  - Added the required column `visit_date` to the `patient_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `patient_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `patient_visit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_visit" DROP COLUMN "arrival_time",
ADD COLUMN     "visit_date" DATE NOT NULL,
DROP COLUMN "start_time",
ADD COLUMN     "start_time" VARCHAR(5) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" VARCHAR(5) NOT NULL;
