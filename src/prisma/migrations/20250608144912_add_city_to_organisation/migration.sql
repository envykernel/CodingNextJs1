-- AlterTable
ALTER TABLE "organisation" ADD COLUMN     "city" VARCHAR(100);

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;
