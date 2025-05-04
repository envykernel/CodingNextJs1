/*
  Warnings:

  - Added the required column `organisation_id` to the `patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "patient_measurements" DROP CONSTRAINT "patient_measurements_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_medical" DROP CONSTRAINT "patient_medical_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "patient_medical_history" DROP CONSTRAINT "patient_medical_history_patient_id_fkey";

-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "organisation_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "doctor" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "specialty" VARCHAR(100),
    "phone_number" VARCHAR(50),
    "email" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'enabled',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone_number" VARCHAR(50),
    "email" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'enabled',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_appointment" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER,
    "appointment_date" TIMESTAMP(6) NOT NULL,
    "appointment_type" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_doctor_organisation_id" ON "doctor"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_doctor_id" ON "patient_appointment"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_organisation_id" ON "patient_appointment"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_patient_id" ON "patient_appointment"("patient_id");

-- CreateIndex
CREATE INDEX "idx_patient_organisation_id" ON "patient"("organisation_id");

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical" ADD CONSTRAINT "patient_medical_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
