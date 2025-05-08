/*
  Warnings:

  - A unique constraint covering the columns `[visit_id]` on the table `patient_measurements` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "patient_measurements" DROP CONSTRAINT "patient_measurements_organisation_id_fkey";

-- AlterTable
ALTER TABLE "patient_measurements" ADD COLUMN     "location" VARCHAR(50),
ADD COLUMN     "measurement_type" VARCHAR(50) DEFAULT 'routine',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "oxygen_saturation" DECIMAL(5,2),
ADD COLUMN     "pulse" INTEGER,
ADD COLUMN     "respiratory_rate" INTEGER,
ADD COLUMN     "taken_by" VARCHAR(100),
ADD COLUMN     "visit_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "patient_measurements_visit_id_key" ON "patient_measurements"("visit_id");

-- CreateIndex
CREATE INDEX "patient_measurements_patient_id_idx" ON "patient_measurements"("patient_id");

-- CreateIndex
CREATE INDEX "patient_measurements_visit_id_idx" ON "patient_measurements"("visit_id");

-- CreateIndex
CREATE INDEX "patient_measurements_measured_at_idx" ON "patient_measurements"("measured_at");

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_patient_measurements_organisation_id" RENAME TO "patient_measurements_organisation_id_idx";
