-- CreateTable
CREATE TABLE "prescription" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "notes" VARCHAR(1000),

    CONSTRAINT "prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_line" (
    "id" SERIAL NOT NULL,
    "prescription_id" INTEGER NOT NULL,
    "drug_name" VARCHAR(255) NOT NULL,
    "dosage" VARCHAR(255),
    "frequency" VARCHAR(255),
    "duration" VARCHAR(255),
    "instructions" VARCHAR(1000),

    CONSTRAINT "prescription_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prescription_visit_id_idx" ON "prescription"("visit_id");

-- CreateIndex
CREATE INDEX "prescription_doctor_id_idx" ON "prescription"("doctor_id");

-- CreateIndex
CREATE INDEX "prescription_organisation_id_idx" ON "prescription"("organisation_id");

-- CreateIndex
CREATE INDEX "prescription_patient_id_idx" ON "prescription"("patient_id");

-- CreateIndex
CREATE INDEX "prescription_line_prescription_id_idx" ON "prescription_line"("prescription_id");

-- CreateIndex
CREATE INDEX "patient_visit_patient_id_idx" ON "patient_visit"("patient_id");

-- CreateIndex
CREATE INDEX "patient_visit_doctor_id_idx" ON "patient_visit"("doctor_id");

-- CreateIndex
CREATE INDEX "patient_visit_organisation_id_idx" ON "patient_visit"("organisation_id");

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_line" ADD CONSTRAINT "prescription_line_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
