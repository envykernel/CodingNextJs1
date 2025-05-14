-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'INSURANCE', 'CHEQUE', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "organisationId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "organisationId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "patient" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "birthdate" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "doctor_id" INTEGER,
    "status" VARCHAR(50),
    "avatar" VARCHAR(255),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "phone_number" VARCHAR(30),
    "email" VARCHAR(100),
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(30),
    "emergency_contact_email" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "organisation_id" INTEGER NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_measurements" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "measured_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "weight_kg" DOUBLE PRECISION,
    "height_cm" DOUBLE PRECISION,
    "temperature_c" DOUBLE PRECISION,
    "blood_pressure_systolic" INTEGER,
    "blood_pressure_diastolic" INTEGER,
    "organisation_id" INTEGER NOT NULL,
    "location" VARCHAR(50),
    "measurement_type" VARCHAR(50) DEFAULT 'routine',
    "notes" TEXT,
    "oxygen_saturation" DOUBLE PRECISION,
    "pulse" INTEGER,
    "respiratory_rate" INTEGER,
    "taken_by" VARCHAR(100),
    "visit_id" INTEGER,

    CONSTRAINT "patient_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "organisation_id" INTEGER NOT NULL,

    CONSTRAINT "patient_medical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical_history" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "history_type" VARCHAR(100),
    "description" TEXT NOT NULL,
    "date_occurred" DATE,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "organisation_id" INTEGER NOT NULL,

    CONSTRAINT "patient_medical_history_pkey" PRIMARY KEY ("id")
);

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
    "break_end_time" VARCHAR(5),
    "break_start_time" VARCHAR(5),
    "work_end_time" VARCHAR(5),
    "work_start_time" VARCHAR(5),
    "working_days" VARCHAR(20)[],

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

-- CreateTable
CREATE TABLE "UserInternal" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "organisationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInternal_pkey" PRIMARY KEY ("userId")
);

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

-- CreateTable
CREATE TABLE "medication" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "organisation_id" INTEGER,
    "dosages" VARCHAR(100)[],

    CONSTRAINT "medication_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "idx_patient_organisation_id" ON "patient"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_doctor_id" ON "patient"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_measurements_visit_id_key" ON "patient_measurements"("visit_id");

-- CreateIndex
CREATE INDEX "patient_measurements_patient_id_idx" ON "patient_measurements"("patient_id");

-- CreateIndex
CREATE INDEX "patient_measurements_visit_id_idx" ON "patient_measurements"("visit_id");

-- CreateIndex
CREATE INDEX "patient_measurements_organisation_id_idx" ON "patient_measurements"("organisation_id");

-- CreateIndex
CREATE INDEX "patient_measurements_measured_at_idx" ON "patient_measurements"("measured_at");

-- CreateIndex
CREATE INDEX "idx_patient_medical_organisation_id" ON "patient_medical"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_medical_history_organisation_id" ON "patient_medical_history"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_doctor_organisation_id" ON "doctor"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_doctor_id" ON "patient_appointment"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_organisation_id" ON "patient_appointment"("organisation_id");

-- CreateIndex
CREATE INDEX "idx_patient_appointment_patient_id" ON "patient_appointment"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserInternal_email_key" ON "UserInternal"("email");

-- CreateIndex
CREATE INDEX "patient_visit_patient_id_idx" ON "patient_visit"("patient_id");

-- CreateIndex
CREATE INDEX "patient_visit_doctor_id_idx" ON "patient_visit"("doctor_id");

-- CreateIndex
CREATE INDEX "patient_visit_organisation_id_idx" ON "patient_visit"("organisation_id");

-- CreateIndex
CREATE INDEX "clinical_exam_visit_id_idx" ON "clinical_exam"("visit_id");

-- CreateIndex
CREATE INDEX "clinical_exam_organisation_id_idx" ON "clinical_exam"("organisation_id");

-- CreateIndex
CREATE INDEX "clinical_exam_examiner_id_idx" ON "clinical_exam"("examiner_id");

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
CREATE UNIQUE INDEX "medication_name_key" ON "medication"("name");

-- CreateIndex
CREATE INDEX "medication_organisation_id_idx" ON "medication"("organisation_id");

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
ALTER TABLE "Account" ADD CONSTRAINT "Account_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical" ADD CONSTRAINT "patient_medical_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical" ADD CONSTRAINT "patient_medical_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointment" ADD CONSTRAINT "patient_appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInternal" ADD CONSTRAINT "UserInternal_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "patient_appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visit" ADD CONSTRAINT "patient_visit_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_exam" ADD CONSTRAINT "clinical_exam_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_line" ADD CONSTRAINT "prescription_line_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication" ADD CONSTRAINT "medication_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_test_type_id_fkey" FOREIGN KEY ("test_type_id") REFERENCES "lab_test_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_order" ADD CONSTRAINT "lab_test_order_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "patient_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
