/*
  Warnings:

  - You are about to alter the column `weight_kg` on the `patient_measurements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `height_cm` on the `patient_measurements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `temperature_c` on the `patient_measurements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,1)` to `DoublePrecision`.
  - You are about to alter the column `oxygen_saturation` on the `patient_measurements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "patient_measurements" ALTER COLUMN "weight_kg" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "height_cm" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "temperature_c" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "oxygen_saturation" SET DATA TYPE DOUBLE PRECISION;
