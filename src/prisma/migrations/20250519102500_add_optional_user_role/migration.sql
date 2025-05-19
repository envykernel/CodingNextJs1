-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'ACCOUNTANT', 'LAB_TECHNICIAN', 'PHARMACIST', 'USER');

-- AlterTable
ALTER TABLE "UserInternal" ADD COLUMN     "role" "UserRole";
