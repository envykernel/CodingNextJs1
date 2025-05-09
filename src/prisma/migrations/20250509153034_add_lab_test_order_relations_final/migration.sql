-- CreateTable
CREATE TABLE "lab_test_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "default_unit" VARCHAR(50),
    "default_reference_range" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_test_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_order" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "visit_id" INTEGER,
    "doctor_id" INTEGER,
    "test_type_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "ordered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "result_value" VARCHAR(100),
    "result_unit" VARCHAR(50),
    "reference_range" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'pending',
    "notes" TEXT,
    "result_flag" VARCHAR(20),

    CONSTRAINT "lab_test_order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_test_type_name_key" ON "lab_test_type"("name");

-- CreateIndex
CREATE INDEX "lab_test_order_patient_id_idx" ON "lab_test_order"("patient_id");

-- CreateIndex
CREATE INDEX "lab_test_order_visit_id_idx" ON "lab_test_order"("visit_id");

-- CreateIndex
CREATE INDEX "lab_test_order_doctor_id_idx" ON "lab_test_order"("doctor_id");

-- CreateIndex
CREATE INDEX "lab_test_order_test_type_id_idx" ON "lab_test_order"("test_type_id");

-- CreateIndex
CREATE INDEX "lab_test_order_organisation_id_idx" ON "lab_test_order"("organisation_id");

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_test_type_id_fkey" FOREIGN KEY ("test_type_id") REFERENCES "lab_test_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
