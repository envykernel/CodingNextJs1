-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "is_encrypted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;
