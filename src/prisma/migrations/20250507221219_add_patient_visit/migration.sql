-- CreateTable
CREATE TABLE "patient_visit" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER,
    "organisation_id" INTEGER NOT NULL,
    "arrival_time" TIMESTAMP(3),
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "status" VARCHAR(50) DEFAULT 'completed',
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_visit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "patient_appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
