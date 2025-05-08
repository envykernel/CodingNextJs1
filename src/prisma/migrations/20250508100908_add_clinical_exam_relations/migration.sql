-- CreateTable
CREATE TABLE "clinical_exam" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "examiner_id" INTEGER,
    "chief_complaint" VARCHAR(1000),
    "history_illness" VARCHAR(2000),
    "medical_history" VARCHAR(2000),
    "general_appearance" VARCHAR(500),
    "cardiovascular" VARCHAR(1000),
    "respiratory" VARCHAR(1000),
    "gastrointestinal" VARCHAR(1000),
    "neurological" VARCHAR(1000),
    "musculoskeletal" VARCHAR(1000),
    "skin" VARCHAR(1000),
    "ent" VARCHAR(1000),
    "assessment" VARCHAR(2000),
    "plan" VARCHAR(2000),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_exam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinical_exam_visit_id_idx" ON "clinical_exam"("visit_id");

-- CreateIndex
CREATE INDEX "clinical_exam_organisation_id_idx" ON "clinical_exam"("organisation_id");

-- CreateIndex
CREATE INDEX "clinical_exam_examiner_id_idx" ON "clinical_exam"("examiner_id");

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
