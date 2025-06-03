-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DOCTOR_OWNER';

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;
