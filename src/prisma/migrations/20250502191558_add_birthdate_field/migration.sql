-- CreateTable
CREATE TABLE "patient" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "birthdate" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "doctor" VARCHAR(100),
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

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_measurements" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "measured_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "weight_kg" DECIMAL(5,2),
    "height_cm" DECIMAL(5,2),
    "temperature_c" DECIMAL(4,1),
    "blood_pressure_systolic" INTEGER,
    "blood_pressure_diastolic" INTEGER,

    CONSTRAINT "patient_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

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

    CONSTRAINT "patient_medical_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_measurements" ADD CONSTRAINT "patient_measurements_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_medical" ADD CONSTRAINT "patient_medical_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
