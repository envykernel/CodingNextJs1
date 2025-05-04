/*
  Warnings:

  - Added the required column `organisation_id` to the `patient_measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisation_id` to the `patient_medical` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisation_id` to the `patient_medical_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_measurements" ADD COLUMN     "organisation_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patient_medical" ADD COLUMN     "organisation_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patient_medical_history" ADD COLUMN     "organisation_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "idx_patient_measurements_organisation_id" ON "patient_measurements"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_medical_organisation_id" ON "patient_medical"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_medical_history_organisation_id" ON "patient_medical_history"("organisation_id");

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical" ADD CONSTRAINT "patient_medical_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
