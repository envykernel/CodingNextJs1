-- AlterTable
ALTER TABLE "organisation" ADD COLUMN     "footer_height" INTEGER DEFAULT 200,
ADD COLUMN     "has_pre_printed_footer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_pre_printed_header" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "header_height" INTEGER DEFAULT 200;

-- AlterTable
ALTER TABLE "radiology_order" ALTER COLUMN "ordered_at" SET DEFAULT CURRENT_TIMESTAMP::text;
