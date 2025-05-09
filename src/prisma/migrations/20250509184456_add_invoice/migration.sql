-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'INSURANCE', 'CHEQUE', 'OTHER');

-- CreateTable
CREATE TABLE "service" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "visit_id" INTEGER,
    "invoice_number" VARCHAR(30) NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "receipt_number" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "transaction_id" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_application" (
    "id" SERIAL NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "invoice_line_id" INTEGER,
    "amount_applied" DECIMAL(10,2) NOT NULL,
    "applied_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_code_key" ON "service"("code");

-- CreateIndex
CREATE INDEX "service_organisation_id_idx" ON "service"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_organisation_id_code_key" ON "service"("organisation_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoice_number_key" ON "invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "invoice_organisation_id_idx" ON "invoice"("organisation_id");

-- CreateIndex
CREATE INDEX "invoice_patient_id_idx" ON "invoice"("patient_id");

-- CreateIndex
CREATE INDEX "invoice_visit_id_idx" ON "invoice"("visit_id");

-- CreateIndex
CREATE INDEX "invoice_invoice_number_idx" ON "invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "invoice_line_organisation_id_idx" ON "invoice_line"("organisation_id");

-- CreateIndex
CREATE INDEX "invoice_line_invoice_id_idx" ON "invoice_line"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_line_service_id_idx" ON "invoice_line"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipt_number_key" ON "payment"("receipt_number");

-- CreateIndex
CREATE INDEX "payment_organisation_id_idx" ON "payment"("organisation_id");

-- CreateIndex
CREATE INDEX "payment_patient_id_idx" ON "payment"("patient_id");

-- CreateIndex
CREATE INDEX "payment_receipt_number_idx" ON "payment"("receipt_number");

-- CreateIndex
CREATE INDEX "payment_application_organisation_id_idx" ON "payment_application"("organisation_id");

-- CreateIndex
CREATE INDEX "payment_application_payment_id_idx" ON "payment_application"("payment_id");

-- CreateIndex
CREATE INDEX "payment_application_invoice_id_idx" ON "payment_application"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_application_invoice_line_id_idx" ON "payment_application"("invoice_line_id");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_invoice_payments_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_invoice_payment_applications_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_invoice_line_apps_fkey" FOREIGN KEY ("invoice_line_id") REFERENCES "invoice_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_application" ADD CONSTRAINT "payment_application_invoice_line_payment_applications_fkey" FOREIGN KEY ("invoice_line_id") REFERENCES "invoice_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
