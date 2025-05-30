-- CreateTable
CREATE TABLE "radiology_exam_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_exam_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_order" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "visit_id" INTEGER,
    "doctor_id" INTEGER,
    "exam_type_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "ordered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'pending',
    "notes" TEXT,
    "result" TEXT,
    "result_date" TIMESTAMP(3),

    CONSTRAINT "radiology_order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "radiology_exam_type_name_key" ON "radiology_exam_type"("name");

-- CreateIndex
CREATE INDEX "radiology_exam_type_category_idx" ON "radiology_exam_type"("category");

-- CreateIndex
CREATE INDEX "radiology_order_patient_id_idx" ON "radiology_order"("patient_id");

-- CreateIndex
CREATE INDEX "radiology_order_visit_id_idx" ON "radiology_order"("visit_id");

-- CreateIndex
CREATE INDEX "radiology_order_doctor_id_idx" ON "radiology_order"("doctor_id");

-- CreateIndex
CREATE INDEX "radiology_order_exam_type_id_idx" ON "radiology_order"("exam_type_id");

-- CreateIndex
CREATE INDEX "radiology_order_organisation_id_idx" ON "radiology_order"("organisation_id");

-- CreateIndex
CREATE INDEX "radiology_order_status_idx" ON "radiology_order"("status");

-- AddForeignKey
ALTER TABLE "radiology_order" ADD CONSTRAINT "radiology_order_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_order" ADD CONSTRAINT "radiology_order_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_order" ADD CONSTRAINT "radiology_order_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_order" ADD CONSTRAINT "radiology_order_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "radiology_exam_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_order" ADD CONSTRAINT "radiology_order_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
